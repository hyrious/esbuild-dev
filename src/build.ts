import {
  build as esbuild,
  context,
  version,
  BuildOptions,
  Plugin,
  BuildContext,
  BuildFailure,
  Message,
} from "esbuild";
import { existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { tmpdir as _tmpdir } from "os";
import { dirname, join } from "path";
import { pathToFileURL, URL } from "url";
import { block, external, ExternalPluginOptions, isEmpty, isObj, splitSearch } from "./utils";

const extname = { esm: ".js", cjs: ".cjs" } as const;

export type Format = keyof typeof extname;

function findNodeModules(dir: string): string | undefined {
  const path = join(dir, "node_modules");
  if (existsSync(path) && statSync(path).isDirectory()) {
    return path;
  } else {
    const parent = dirname(dir);
    if (parent !== dir) {
      return findNodeModules(parent);
    }
  }
  return;
}

let tmpdir_: string | undefined;
const supportsPackagesExternal = /* @__PURE__ */ (() => {
  const [a, b, c] = [0, 16, 5];
  const [major, minor, patch] = version.split(".").slice(0, 3).map(Number);
  return major > a || (major === a && minor > b) || (major === a && minor === b && patch >= c);
})();

class BuildError extends Error implements BuildFailure {
  constructor(public errors: Message[], public warnings: Message[]) {
    super("Build failed");
    this.name = "BuildFailure";
  }
}

export async function build(
  entry: string,
  options: BuildOptions & { format: Format },
  externalPluginOptions?: ExternalPluginOptions,
  watchOptions?: { onRebuild: (error: BuildFailure | null, stop: () => void) => void },
) {
  if (!tmpdir_) {
    tmpdir_ = join(findNodeModules(process.cwd()) || _tmpdir(), ".esbuild-dev");
    mkdirSync(tmpdir_, { recursive: true });
    writeFileSync(join(tmpdir_, "package.json"), '{"type":"module"}');
  }
  options = {
    entryPoints: [entry],
    platform: "node",
    target: `node${process.versions.node}`,
    bundle: true,
    sourcemap: true,
    sourcesContent: false,
    treeShaking: true,
    outfile: join(tmpdir_, entry.replace(/[\/\\]/g, "+") + extname[options.format]),
    ...options,
  };
  if (isEmpty(externalPluginOptions) && supportsPackagesExternal) {
    options.packages = "external";
  } else {
    (options.plugins ||= []).push(external({ exclude: false, ...externalPluginOptions }));
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
    await esbuild(options);
  }
  return { outfile: options.outfile! };
}

export async function importFile(
  path: string,
  options: BuildOptions = {},
  externalPluginOptions?: ExternalPluginOptions,
) {
  const [entry, search] = splitSearch(path);
  const { outfile } = await build(entry, { ...options, format: "esm" }, externalPluginOptions);
  return import(pathToFileURL(outfile).toString() + search);
}

let requireShim: NodeRequire | undefined;
export async function requireFile(
  path: string,
  options: BuildOptions = {},
  externalPluginOptions?: ExternalPluginOptions,
) {
  const [entry, search] = splitSearch(path);
  const { outfile } = await build(entry, { ...options, format: "cjs" }, externalPluginOptions);
  if (__ESM__) {
    requireShim ||= createRequire(import.meta.url);
    return requireShim(outfile + search);
  } else {
    return require(outfile + search);
  }
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
    if (__ESM__) {
      requireShim ||= createRequire(import.meta.url);
      return requireShim(name);
    } else {
      return require(name);
    }
  } catch {
    return import(name);
  }
}

export let loaderPath: string;
if (__ESM__) {
  loaderPath = new URL("./loader.mjs", import.meta.url).pathname;
} else {
  loaderPath = require.resolve("./loader.mjs");
}

export async function resolve(id: string, resolveDir: string) {
  let result: string | undefined;
  await esbuild({
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
