import { ChildProcess, spawn, spawnSync } from "child_process";
import { BuildFailure, BuildOptions } from "esbuild";
import { readFile } from "fs/promises";
import { dirname } from "path";
import { pathToFileURL } from "url";
import { EsbuildDevFlags, EsbuildDevOptions, EsbuildFlags, parse } from "../args.js";
import { Format, build, delay, loadPlugins, loaderPath } from "../index.js";
import { resolveMangleCache } from "./utils";

const error = `
[esbuild-dev] something went wrong on spawn node process
              but you can try to run the file by hand:
    > node --enable-source-maps {file} {args}
`;

export function errorMessage(file: string, args: string[]) {
  const tpl = { file, args: args.map(e => JSON.stringify(e)).join(" ") };
  return error.replace(/{(\w+)}/g, (_, key: "file" | "args") => tpl[key] || "");
}

export async function defaultCommand(entry: string, argsBeforeEntry: string[], argsAfterEntry: string[]) {
  const { _: _1, ...devOptionsRaw } = parse(argsBeforeEntry, EsbuildDevFlags);
  const { _: _2, ...buildOptionsRaw } = parse(_1, EsbuildFlags);

  const argsToEntry = [..._2, ...argsAfterEntry];

  const devOptions = { shims: true, cache: true, ...devOptionsRaw } as EsbuildDevOptions;
  const buildOptions = buildOptionsRaw as BuildOptions & { format: Format };
  if (devOptions.import) devOptions.loader = true;
  if (devOptions.loader && (devOptions.cjs || devOptions.plugin || devOptions.watch || devOptions.include)) {
    throw new Error(`--cjs, --plugin, --watch and --include are not supported with --loader`);
  }
  if (devOptions.loader || devOptions.plugin || devOptions.watch) {
    devOptions.cache = false;
  }

  buildOptions.format = devOptions.cjs ? "cjs" : "esm";
  resolveMangleCache(buildOptions);

  let spawnArgs: string[];
  if (devOptions.loader) {
    const v = process.versions.node.split(".").map(e => Number.parseInt(e));
    const register = v[0] > 20 || (v[0] === 20 && v[1] >= 6) || (v[0] === 18 && v[1] >= 19);

    spawnArgs = ["--loader", loaderPath, "--enable-source-maps", entry, ...argsToEntry];
    if (register) spawnArgs[0] = "--import";
    if (devOptions.node) spawnArgs.splice(3, 0, ...devOptions.node);
    if (devOptions.noWarnings) spawnArgs.unshift("--no-warnings");

    process.exit(
      spawnSync(process.argv0, spawnArgs, { stdio: "inherit", cwd: process.cwd(), env: process.env })
        .status || 0,
    );
  } else {
    let plugins = buildOptions.plugins || [];
    if (devOptions.plugin) {
      plugins = plugins.concat(await loadPlugins(devOptions.plugin));
    }

    if (devOptions.shims) {
      const shimsFilter = /\.[cm]?[jt]s$/;

      const define = buildOptions.define || {};
      define["__dirname"] ||= "__injected_dirname";
      define["__filename"] ||= "__injected_filename";
      define["import.meta.url"] ||= "__injected_import_meta_url";
      define["import.meta.dirname"] ||= "__injected_dirname";
      define["import.meta.filename"] ||= "__injected_filename";
      buildOptions.define = define;

      // Hack all plugin's onLoad callback to add shims.
      // An `onTransform` callback can be implemented to esbuild plugin system.
      // But I don't want to make this feature too wide.
      // See https://gist.github.com/hyrious/ac6fd074c2f6d24a306c3a0970617cbc
      plugins = plugins.map(p => ({
        name: `shim(${p.name})`,
        setup({ onLoad: realOnLoad, ...build }) {
          const onLoad: typeof realOnLoad = function (filter, callback) {
            return realOnLoad(filter, async args => {
              const result = await callback(args);
              if (result && shimsFilter.test(args.path) && typeof result.contents === "string") {
                result.contents = prependShims(define, args, result.contents);
              }
              return result;
            });
          };
          return p.setup({ onLoad, ...build });
        },
      }));

      // Capture all other files.
      plugins.push({
        name: "replace-import-meta",
        setup({ onLoad }) {
          onLoad({ filter: shimsFilter }, async args => {
            const contents = await readFile(args.path, "utf8");

            return {
              loader: "default",
              contents: prependShims(define, args, contents),
            };
          });
        },
      });
    }

    buildOptions.plugins = plugins;

    let outfile: string;
    let stop: (() => void) | undefined;
    let child: ChildProcess | undefined;

    const kill = async () => {
      if (child) {
        child.kill("SIGTERM");
        await delay(200);
      }
      if (child && !child.killed) {
        child.kill("SIGKILL");
        await delay(100);
      }
    };

    const on_close = (code: number | null) => {
      if (devOptions.watch) {
        console.log(`[esbuild-dev] child process stopped with code`, code);
      }
      process.exitCode = Number(code); // Number(null) = 0
      child = undefined;
    };

    const on_error = async () => {
      console.error(errorMessage(outfile, spawnArgs));
      await kill();
      child = undefined;
    };

    const run = async () => {
      try {
        await kill();
        spawnArgs = ["--enable-source-maps", outfile, ...argsToEntry];
        if (devOptions.node) spawnArgs.splice(1, 0, ...devOptions.node);
        child = spawn(process.argv0, spawnArgs, { stdio: "inherit", cwd: process.cwd(), env: process.env });
        child.on("close", on_close);
        child.on("error", on_error);
      } catch {
        await on_error();
      }
    };

    let watchOptions: { onRebuild: (error: BuildFailure | null, stop: () => void) => void } | undefined;
    if (devOptions.watch) {
      watchOptions = {
        onRebuild(error, stop_) {
          stop = stop_;
          if (!error) run();
        },
      };
    }

    const externalOptions = { include: devOptions.include };
    const cacheOptions = { cache: devOptions.cache };
    const restart = async () => {
      await kill();
      stop && stop();
      ({ outfile } = await build(entry, buildOptions, externalOptions, watchOptions, cacheOptions));
      await run();
    };

    restart().catch(() => process.exit(1));

    if (devOptions.watch) {
      process.stdin.on("data", async e => {
        if (e.toString().startsWith("exit")) {
          await kill();
          stop && stop();
          process.exit(0);
        } else if (e.toString().startsWith("rs")) {
          await restart();
        }
      });
    }
  }
}

function prependShims(define: Record<string, string>, args: { path: string }, contents: string) {
  const shims =
    `const ${define["__dirname"]} = ${JSON.stringify(dirname(args.path))};` +
    `const ${define["__filename"]} = ${JSON.stringify(args.path)};` +
    `const ${define["import.meta.url"]} = ${JSON.stringify(pathToFileURL(args.path).href)};`;

  if (contents.startsWith("#!")) {
    const i = contents.indexOf("\n") + 1;
    return contents.slice(0, i) + shims + contents.slice(i);
  }

  return shims + contents;
}
