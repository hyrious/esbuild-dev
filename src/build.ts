import {
  build as esbuild_build,
  context,
  version,
  BuildOptions,
  Plugin,
  BuildContext,
  BuildFailure,
  Message,
} from "esbuild";
import { existsSync, lstatSync, mkdirSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { pathToFileURL, URL } from "url";
import { block, external, ExternalPluginOptions, isEmpty, isObj, splitSearch } from "./utils";
import { readFile } from "fs/promises";

const extname = { esm: ".js", cjs: ".cjs" } as const;

export type Format = keyof typeof extname;

function findNodeModules(dir: string): string | undefined {
  const path = join(dir, "node_modules");
  if (existsSync(path) && lstatSync(path).isDirectory()) {
    return path;
  } else {
    const parent = dirname(dir);
    if (parent !== dir) {
      return findNodeModules(parent);
    }
  }
  return;
}

export const tempDirectory = (cwd = process.cwd()) => {
  return join(findNodeModules(cwd) || tmpdir(), ".esbuild-dev");
};

const supportsPackagesExternal = /*#__PURE__*/ (() => {
  const [a, b, c] = [0, 16, 5];
  const [major, minor, patch] = version.split(".").slice(0, 3).map(Number);
  return major > a || (major === a && minor > b) || (major === a && minor === b && patch >= c);
})();

class BuildError extends Error implements BuildFailure {
  constructor(
    public errors: Message[],
    public warnings: Message[],
  ) {
    super("Build failed");
    this.name = "BuildFailure";
  }
}

function mtime(path: string) {
  try {
    return lstatSync(path).mtimeMs;
  } catch {
    return 0;
  }
}

export interface CacheOptions {
  cwd?: string;
  cache?: boolean;
  shims?: boolean;
}

function normalize(path: string) {
  if (path.startsWith("./")) {
    path = path.slice(2);
  }
  return path.replace(/[\/\\]/g, "+");
}

export async function build(
  entry: string,
  options: BuildOptions & { format: Format },
  externalOptions?: ExternalPluginOptions,
  cacheOptions?: CacheOptions,
  watchOptions?: { onRebuild: (error: BuildFailure | null, stop: () => void) => void },
) {
  let tmpdir = tempDirectory(cacheOptions?.cwd);
  if (!existsSync(join(tmpdir, "package.json"))) {
    mkdirSync(tmpdir, { recursive: true });
    writeFileSync(join(tmpdir, "package.json"), '{"type":"module"}');
  }
  options = {
    entryPoints: [entry],
    platform: "node",
    target: `node${process.versions.node}`,
    bundle: true,
    sourcemap: true,
    sourcesContent: false,
    treeShaking: true,
    outfile: join(tmpdir, normalize(entry) + extname[options.format]),
    ...options,
  };
  if (cacheOptions?.cache && mtime(options.outfile!) > mtime(entry)) {
    return { outfile: options.outfile! };
  }
  if (isEmpty(externalOptions) && supportsPackagesExternal) {
    options.packages = "external";
  } else {
    (options.plugins ||= []).push(external({ ignore: false, ...externalOptions }));
  }

  if (cacheOptions?.shims) {
    const shimsFilter = /\.[cm]?[jt]s$/;

    const define = options.define || {};
    define["__dirname"] ||= "__injected_dirname";
    define["__filename"] ||= "__injected_filename";
    define["import.meta.url"] ||= "__injected_import_meta_url";
    define["import.meta.dirname"] ||= "__injected_dirname";
    define["import.meta.filename"] ||= "__injected_filename";
    options.define = define;

    let plugins = options.plugins || [];
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

    options.plugins = plugins;
  }

  if (watchOptions) {
    let ctx: BuildContext;
    let { promise, resolve, reject } = block();
    (options.plugins ||= []).push({
      name: "on-rebuild",
      setup({ onEnd }) {
        const stop = () => ctx.dispose();
        let count = 0;
        onEnd(({ errors, warnings }) => {
          const error = errors.length > 0 ? new BuildError(errors, warnings) : null;
          if (count++ > 0) {
            watchOptions.onRebuild(error, stop);
          } else if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      },
    });
    ctx = await context(options);
    await ctx.watch();
    await promise;
  } else {
    await esbuild_build(options);
  }
  return { outfile: options.outfile! };
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

export async function importFile(
  path: string,
  options: BuildOptions = {},
  externalPluginOptions?: ExternalPluginOptions,
  cacheOptions?: CacheOptions,
) {
  const [entry, search] = splitSearch(path);
  const { outfile } = await build(entry, { ...options, format: "esm" }, externalPluginOptions, cacheOptions);
  return import(pathToFileURL(outfile).toString() + search);
}

let requireShim: NodeRequire | undefined;
export async function requireFile(
  path: string,
  options: BuildOptions = {},
  externalPluginOptions?: ExternalPluginOptions,
  cacheOptions?: CacheOptions,
) {
  const [entry, search] = splitSearch(path);
  const { outfile } = await build(entry, { ...options, format: "cjs" }, externalPluginOptions, cacheOptions);
  ESM: requireShim ||= createRequire(import.meta.url);
  ESM: return requireShim(outfile + search);
  CJS: return require(outfile + search);
}

export async function loadPlugins(args: string[]) {
  const plugins: Plugin[] = [];
  for (let text of args) {
    let plugin: any = null;
    let pluginArg: any = undefined;
    if (text[0] === "{") {
      plugin = new Function("return " + text);
    } else {
      const match = text.match(/^([@./\\\w|^{}-]+)(=(.*))?$/);
      if (match) {
        text = match[1];
        pluginArg = new Function("return " + match[3])();
      } else {
        throw new Error(`invalid plugin argument: ${JSON.stringify(text)}`);
      }
      try {
        if (text[0] === ".") {
          plugin = await importFile(text);
        } else {
          plugin = await requireOrImport(text);
        }
      } catch (err) {
        throw new Error(`cannot load plugin ${JSON.stringify(text)}: ${err.message}.`);
      }
    }
    if (typeof plugin === "object") {
      plugin = plugin.default || guessEntry(plugin);
    }
    if (!plugin) {
      throw new Error(`cannot find entry for plugin ${JSON.stringify(text)}.`);
    }
    if (typeof plugin === "function") {
      plugin = plugin.call(plugin, pluginArg);
    }
    plugins.push(plugin);
  }
  return plugins;
}

function guessEntry(object: any): Plugin | undefined {
  if (isObj(object)) {
    for (const key of Object.keys(object)) {
      if (key[0] === "_") continue;
      const maybePlugin = object[key];
      if (
        isObj(maybePlugin) &&
        typeof maybePlugin["name"] === "string" &&
        typeof maybePlugin["setup"] === "function"
      ) {
        return maybePlugin as Plugin;
      }
    }
  }
  return;
}

async function requireOrImport(name: string): Promise<any> {
  try {
    ESM: requireShim ||= createRequire(import.meta.url);
    ESM: return requireShim(name);
    CJS: return require(name);
  } catch {
    return import(name);
  }
}

function getLoaderPath() {
  ESM: return new URL("./loader.js", import.meta.url).toString();
  CJS: return require.resolve("./loader.js");
}

export const loaderPath = /*#__PURE__*/ getLoaderPath();

export async function resolve(id: string, resolveDir: string) {
  let result: string | undefined;
  await esbuild_build({
    stdin: {
      contents: `import ${JSON.stringify(id)}`,
      resolveDir,
    },
    write: false,
    bundle: true,
    platform: "node",
    plugins: [
      {
        name: "resolve",
        setup({ onLoad }) {
          onLoad({ filter: /.*/ }, args => {
            result = args.path;
            return { contents: "" };
          });
        },
      },
    ],
  });
  return result;
}
