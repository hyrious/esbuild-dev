import { ChildProcess, spawn, spawnSync } from "child_process";
import esbuild, { BuildOptions } from "esbuild";
import { argv, argv0, cwd, env, exit, stdin } from "process";
import { name, version as versionText } from "../package.json";
import {
  EsbuildDevExternalFlags,
  EsbuildDevFlags,
  EsbuildFlags,
  parse,
} from "./args";
import helpText from "./help.txt";
import {
  build,
  delay,
  EsbuildDevOptions,
  external,
  Format,
  loaderPath,
  loadPlugins,
} from "./internal";

const error = `
[esbuild-dev] something went wrong on spawn node process
              but you can try to run the file by hand:
    > node --enable-source-maps {file} {args}
`;

function errorMessage(file: string, args: string[]) {
  const tpl = { file, args: args.map(e => JSON.stringify(e)).join(" ") };
  return error.replace(/{(\w+)}/g, (_, key: "file" | "args") => tpl[key] || "");
}

const args = argv.slice(2);

const SubCommands = ["external"] as const;
type SubCommand = typeof SubCommands[number];

// pre-process the command, entry, help, version
const command =
  SubCommands.includes(args[0] as SubCommand) && (args.shift() as SubCommand);

let argsBeforeEntry: string[] = [];
let argsAfterEntry: string[] = [];
let entry: string | undefined;
let help = false;
let version = false;
for (let i = 0; i < args.length; ++i) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") {
    help = true;
    continue;
  }
  if (arg === "--version" || arg.toLowerCase() === "-v") {
    version = true;
    continue;
  }
  if (arg[0] !== "-") {
    entry = arg;
    argsAfterEntry = args.slice(i + 1);
    break;
  }
  argsBeforeEntry.push(arg);
}
help ||= !entry;

if (version) console.log(`${name} ${versionText}, esbuild ${esbuild.version}`);
if (help) console.log(helpText);
if (help || version) exit(0);

const entryPoint = entry!;

if (command === "external") {
  const { _: _1, bare } = parse(argsBeforeEntry, EsbuildDevExternalFlags);
  const { _: _2, ...buildOptionsRaw } = parse(argsAfterEntry, EsbuildFlags);

  void _1, _2; // ignored

  const collected: Record<string, true> = {};
  const onResolve = ({ path }: { path: string }) => {
    collected[path] = true;
  };

  const buildOptions = buildOptionsRaw as BuildOptions & { format: Format };
  delete buildOptions.platform;
  buildOptions.format ||= "esm";
  buildOptions.target ||= "esnext";
  (buildOptions.plugins ||= []).push(external({ onResolve }));

  try {
    await build(entryPoint, buildOptions);
    const result = Object.keys(collected);
    console.log(bare ? result.join("\n") : result);
  } catch {}
} else {
  const { _: _1, ...devOptionsRaw } = parse(argsBeforeEntry, EsbuildDevFlags);
  const { _: _2, ...buildOptionsRaw } = parse(_1, EsbuildFlags);

  const argsToEntry = [..._2, ...argsAfterEntry];

  const devOptions = devOptionsRaw as EsbuildDevOptions;
  const buildOptions = buildOptionsRaw as BuildOptions & { format: Format };
  if (devOptions.cjs) devOptions.bundle = true;
  buildOptions.format = devOptions.cjs ? "cjs" : "esm";

  let spawnArgs: string[];
  if (devOptions.bundle) {
    if (devOptions.plugin) {
      const plugins = await loadPlugins(devOptions.plugin);
      (buildOptions.plugins ||= []).push(...plugins);
    }

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

        child = spawn(argv0, spawnArgs, { stdio: "inherit", cwd: cwd(), env });
        child.on("close", on_close);
        child.on("error", on_error);
      } catch {
        await on_error();
      }
    };

    if (devOptions.watch) {
      buildOptions.watch = {
        onRebuild(_err, result) {
          if (result) ({ stop } = result), run();
        },
      };
    }

    try {
      ({
        outfile,
        result: { stop },
      } = await build(entryPoint, buildOptions));
    } catch {
      exit(1);
    }

    run();

    if (devOptions.watch) {
      stdin.on("data", async e => {
        if (e.toString().startsWith("exit")) {
          await kill();
          stop && stop();
          exit(0);
        }
      });
    }
  } else {
    spawnArgs = [
      "--experimental-loader",
      loaderPath,
      "--enable-source-maps",
      entryPoint,
      ...argsToEntry,
    ];
    if (devOptions.noWarnings) spawnArgs.unshift("--no-warnings");

    const env2 = { ...env };
    let longestKey = "__ESBUILD_PLUGINS__";
    while (longestKey in env2) {
      longestKey += "_";
    }
    env2[longestKey] = JSON.stringify(devOptions.plugin || []);

    exit(
      spawnSync(argv0, spawnArgs, {
        stdio: "inherit",
        cwd: cwd(),
        env: env2,
      }).status || 0
    );
  }
}
