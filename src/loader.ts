import esbuild, {
  Loader,
  OnLoadArgs,
  OnResolveArgs,
  OnResolveResult,
  PartialMessage,
  transform,
} from "esbuild";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { dirname, relative } from "path";
import { cwd } from "process";
import { fileURLToPath, pathToFileURL, URL } from "url";
import { TextDecoder } from "util";
import { getPluginsFromEnv, resolveByEsbuild } from "./internal/build";
import * as types from "./internal/types";

function errorMessage(
  name: string,
  kind: "resolving" | "loading",
  path: string,
  cause: { message: string }
): string | undefined {
  [name, path] = [JSON.stringify(name), JSON.stringify(path)];
  return `[esbuild-dev] plugin ${name} error in ${kind} ${path}: ${cause.message}`;
}

function getSuffix(url: string) {
  try {
    return new URL(url).search;
  } catch {
    return "";
  }
}

function transformCode(
  code: string,
  sourcefile: string,
  loader: Loader,
  context: types.LoadContext
) {
  return transform(code, {
    sourcefile,
    sourcemap: "inline",
    loader,
    target: `node${process.versions.node}`,
    format: context.format === "module" ? "esm" : "cjs",
  });
}

async function printErrorsAndWarnings({
  errors,
  warnings,
}: {
  errors?: PartialMessage[];
  warnings?: PartialMessage[];
}) {
  if (errors && errors.length > 0) {
    for (const string of await esbuild.formatMessages(errors, {
      kind: "error",
      color: true,
    })) {
      console.error(string);
    }
  }
  if (warnings && warnings.length > 0) {
    for (const string of await esbuild.formatMessages(warnings, {
      kind: "warning",
      color: true,
    })) {
      console.warn(string);
    }
  }
}

let plugins = await getPluginsFromEnv();
plugins.push({
  name: "__default_loader__",
  setup({ onResolve, onLoad }) {
    onResolve({ filter: /.*/ }, () => ({}));
    onLoad({ filter: /.*/ }, () => ({}));
  },
});
let extensionsRE = /\.m?(tsx?|json|txt)$/;
let textLoaders = new Set<Loader>([
  "dataurl",
  "json",
  "jsx",
  "text",
  "ts",
  "tsx",
]);

function toLoader(ext: string): Loader {
  if (ext === "txt") return "text";
  return ext as Loader;
}

let textDecoder = new TextDecoder();

function toString(contents: string | Uint8Array): string {
  if (typeof contents === "string") return contents;
  return textDecoder.decode(contents);
}

type Nullable<T> = T | null | undefined;
type MaybePromise<T> = T | Promise<T>;
type OnResolveCallback = {
  name: string;
  options: esbuild.OnResolveOptions;
  callback: (
    args: esbuild.OnResolveArgs
  ) => MaybePromise<Nullable<esbuild.OnResolveResult>>;
};
type OnLoadCallback = {
  name: string;
  options: esbuild.OnLoadOptions;
  callback: (
    args: esbuild.OnLoadArgs
  ) => MaybePromise<Nullable<esbuild.OnLoadResult>>;
};

let onResolveCallbacks: OnResolveCallback[] = [];
let onLoadCallbacks: OnLoadCallback[] = [];

type Stash = Pick<
  OnResolveResult,
  "external" | "namespace" | "suffix" | "pluginData"
>;
let stash = new Map<string, Stash>();

for (const plugin of plugins) {
  plugin.setup({
    esbuild,
    initialOptions: {},
    onStart: fn => fn(),
    onEnd: fn => void fn,
    onResolve: (options, callback) =>
      onResolveCallbacks.push({ name: plugin.name, options, callback }),
    onLoad: (options, callback) =>
      onLoadCallbacks.push({ name: plugin.name, options, callback }),
  });
}

export async function resolve(
  id: string,
  context: types.ResolveContext,
  defaultResolve: types.Resolver
): Promise<types.ResolveResult> {
  const { parentURL } = context;

  if (parentURL && stash.get(parentURL)?.external) {
    const result = await defaultResolve(id, context, defaultResolve);
    stash.set(result.url, { external: true });
    return result;
  }

  // node will provide a file url to the entry point
  // convert it back to relative path for compat with esbuild plugin
  const compatId = parentURL ? id : relative(cwd(), fileURLToPath(id));
  const onResolveArgs: OnResolveArgs = {
    path: compatId,
    importer: parentURL ? fileURLToPath(parentURL) : "",
    namespace: (parentURL && stash.get(parentURL)?.namespace) || "file",
    resolveDir: parentURL ? dirname(fileURLToPath(parentURL)) : cwd(),
    kind: parentURL ? "import-statement" : "entry-point",
    pluginData: parentURL && stash.get(parentURL)?.pluginData,
  };

  for (const { name, options, callback } of onResolveCallbacks) {
    if (
      options.filter.test(compatId) &&
      (!options.namespace || options.namespace === onResolveArgs.namespace)
    ) {
      try {
        const result = await callback(onResolveArgs);
        if (result) {
          if (!result.path) {
            result.path = parentURL
              ? await resolveByEsbuild(id, onResolveArgs.resolveDir)
              : id;
          }
          if (!result.path) {
            return defaultResolve(id, context, defaultResolve);
          }
          if (!result.path.startsWith("file://")) {
            result.path = pathToFileURL(result.path).href;
          }
          stash.set(result.path, result);
          await printErrorsAndWarnings(result);
          return { url: result.path, format: "module" };
        }
      } catch (cause) {
        throw Object.assign(
          new Error(errorMessage(name, "resolving", compatId, cause)),
          { cause }
        );
      }
    }
  }

  return defaultResolve(id, context, defaultResolve);
}

export async function load(
  url: string,
  context: types.LoadContext,
  defaultLoad: types.Loader
): Promise<types.LoadResult> {
  const match = url.match(extensionsRE);
  const compatId = url.startsWith("file://") ? fileURLToPath(url) : url;
  const onLoadArgs: OnLoadArgs = {
    path: compatId,
    namespace: stash.get(url)?.namespace || "file",
    pluginData: stash.get(url)?.pluginData,
    suffix: getSuffix(url),
  };

  for (const { name, options, callback } of onLoadCallbacks) {
    if (
      options.filter.test(compatId) &&
      (!options.namespace || options.namespace === onLoadArgs.namespace)
    ) {
      try {
        const result = await callback(onLoadArgs);
        if (result) {
          if (!result.contents) {
            if (existsSync(compatId)) {
              if (match) {
                const { code, warnings } = await transformCode(
                  await readFile(compatId, "utf-8"),
                  compatId,
                  toLoader(match[1]),
                  context
                );
                result.contents = code;
                result.loader = "js";
                printErrorsAndWarnings({ warnings });
              } else {
                result.contents = await readFile(compatId);
              }
            } else {
              return defaultLoad(url, context, defaultLoad);
            }
          }
          if (
            result.loader &&
            (textLoaders.has(result.loader) ||
              (result.loader === "default" && extensionsRE.test(url)))
          ) {
            const { code, warnings } = await transformCode(
              toString(result.contents),
              compatId,
              result.loader,
              context
            );
            result.contents = code;
            result.loader = "js";
            printErrorsAndWarnings({ warnings });
          }
          if (result.pluginData) {
            if (stash.has(url)) {
              stash.get(url)!.pluginData = result.pluginData;
            } else {
              stash.set(url, { pluginData: result.pluginData });
            }
          }
          if (!result.loader || result.loader === "js") {
            return { source: result.contents, format: "module" };
          }
        }
      } catch (cause) {
        throw Object.assign(
          new Error(errorMessage(name, "loading", compatId, cause)),
          { cause }
        );
      }
    }
  }

  return defaultLoad(url, context, defaultLoad);
}
