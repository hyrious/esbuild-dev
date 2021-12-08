import esbuild, { BuildOptions, Plugin } from "esbuild";
import { existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { tmpdir as _tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { cwd, versions } from "process";
import { pathToFileURL } from "url";
import { version } from "../package.json";

export {
  argsToBuildOptions,
  buildOptionsToArgs,
  parseAndRemoveArgs,
} from "./args";
export { version };

const target = `node${versions.node.split(".").slice(0, 2).join(".")}`;

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
export const tmpdir = join(findNodeModules(cwd()) || _tmpdir(), ".esbuild-dev");

const extname = { esm: ".js", cjs: ".cjs" } as const;
export type Format = keyof typeof extname;

export const externalPlugin: Plugin = {
  name: "external",
  setup({ onResolve }) {
    onResolve({ filter: /^[\w@][^:]/ }, ({ path }) => {
      return { path, external: true };
    });
  },
};

let ensureTmpdir = true;
export async function build(
  entry: string,
  options: BuildOptions & { format: Format }
) {
  if (ensureTmpdir) {
    mkdirSync(tmpdir, { recursive: true });
    writeFileSync(join(tmpdir, "package.json"), '{"type":"module"}');
    ensureTmpdir = false;
  }
  options = {
    entryPoints: [entry],
    platform: "node",
    target,
    bundle: true,
    sourcemap: true,
    sourcesContent: false,
    treeShaking: true,
    outfile: join(tmpdir, entry + extname[options.format]),
    ...options,
  };
  (options.plugins ||= []).push(externalPlugin);
  const result = await esbuild.build(options);
  return { outfile: options.outfile!, result };
}

const PackageNameRegex =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*/;

/**
 * Bundle a file to find out which libraries it is REALLY depending on.
 * This function does not depend on package.json.
 * The file's author should guarantee that the file can be bundled.
 *
 * NOTE: it only outputs DIRECT dependencies, not indirect ones.
 * @example
 * external("a.ts", { loader: { ".css": "text" } })
 * // a.ts: import "esbuild"
 * //=> ["esbuild"]
 */
export async function external(entry: string, options?: BuildOptions) {
  const result: Record<string, true> = {};
  const externalPlugin: Plugin = {
    name: "external",
    setup({ onResolve }) {
      const mark = (path: string) => PackageNameRegex.exec(path)?.[0];
      onResolve({ filter: /^[\w@][^:]/, namespace: "file" }, args => {
        const ret = mark(args.path);
        ret && (result[ret] = true);
        return { path: args.path, external: true };
      });
      const markAsExternal = ({ path }: { path: string }) => ({
        path,
        external: true,
      });
      onResolve({ filter: /^\s*data:/i }, markAsExternal);
      // prettier-ignore
      onResolve({ filter: /\.(css|less|sass|scss|styl|stylus|pcss|postcss|json|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf|wasm)$/, }, markAsExternal);
    },
  };
  options = {
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    target: "esnext",
    write: false,
    ...options,
  };
  (options.plugins ||= []).push(externalPlugin);
  await esbuild.build(options);
  return Object.keys(result);
}

export async function importFile(path: string, options: BuildOptions = {}) {
  const { outfile } = await build(path, { ...options, format: "esm" });
  return import(pathToFileURL(outfile).toString());
}

let requireShim: NodeRequire | undefined;
export async function requireFile(path: string, options: BuildOptions = {}) {
  const { outfile } = await build(path, { ...options, format: "cjs" });
  if (__ESM__) {
    requireShim ||= createRequire(import.meta.url);
    return requireShim(outfile);
  } else {
    return require(outfile);
  }
}

export async function loadPlugin(name: string): Promise<Plugin> {
  let plugin: any;
  let pluginArg: any;
  if (name[0] === "{") {
    // -p:{setup(c){...}}
    plugin = new Function("return " + name) as (arg: any) => Plugin;
  } else {
    const match = name.match(/^([@./\\\w|^{}-]+)(=(.*))?$/);
    if (match) {
      // -p:plugin -p:plugin=arg
      name = match[1];
      pluginArg = new Function("return " + match[3])();
    } else {
      throw new Error(`invalid plugin: ${JSON.stringify(name)}`);
    }
    try {
      if (name[0] === ".") {
        name = resolve(name);
        plugin = await importFile(name);
      } else {
        plugin = await requireOrImport(name);
      }
    } catch (err: any) {
      throw new Error(
        `cannot load plugin ${JSON.stringify(name)}: ${err.message}.`
      );
    }
  }
  if (!plugin) {
    throw new Error(`cannot find plugin: ${JSON.stringify(name)}`);
  }
  if (plugin.default) {
    return unwrap(plugin.default, pluginArg);
  }
  const names = Object.keys(plugin);
  if (names.length) {
    return unwrap(plugin[names[0]], pluginArg);
  }
  throw new Error(`cannot find entry for plugin: ${JSON.stringify(name)}`);
}

function unwrap(mod: any, arg: any) {
  if (typeof mod === "function") {
    try {
      return mod(arg);
    } catch {}
  }
  return mod;
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
