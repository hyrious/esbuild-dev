import module from "module";
import { Loader as EsbuildLoader, PartialMessage, formatMessages, transform } from "esbuild";
import { readFile } from "fs/promises";
import { dirname, extname } from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";
import { resolve as esbuild_resolve } from "./index.js";

async function printErrorsAndWarnings({
  errors,
  warnings,
}: {
  errors?: PartialMessage[];
  warnings?: PartialMessage[];
}) {
  if (errors && errors.length > 0) {
    for (const string of await formatMessages(errors, {
      kind: "error",
      color: true,
    })) {
      console.error(string);
    }
  }
  if (warnings && warnings.length > 0) {
    for (const string of await formatMessages(warnings, {
      kind: "warning",
      color: true,
    })) {
      console.warn(string);
    }
  }
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export interface ResolveContext {
  conditions: string[];
  parentURL?: string;
}

export interface ResolveResult {
  format?: "builtin" | "commonjs" | "json" | "module" | "wasm" | null;
  shortCircuit?: boolean;
  url: string;
}

export type Resolver = (
  id: string,
  context: ResolveContext,
  defaultResolve: Resolver,
) => ResolveResult | Promise<ResolveResult>;

export interface LoadContext {
  conditions: string[];
  format?: ResolveResult["format"];
}

export interface LoadResult {
  format: NonNullable<ResolveResult["format"]>;
  shortCircuit?: boolean;
  source: string | ArrayBuffer | TypedArray;
}

export type Loader = (
  url: string,
  context: LoadContext,
  defaultLoad: Loader,
) => LoadResult | Promise<LoadResult>;

const ExtToLoader: Record<string, EsbuildLoader> = {
  // ".js": "js",
  // ".mjs": "js",
  // ".cjs": "js",
  ".jsx": "jsx",
  ".ts": "ts",
  ".cts": "ts",
  ".mts": "ts",
  ".tsx": "tsx",
  // ".css": "css",
  ".json": "json",
  ".txt": "text",
};

export async function resolve(
  id: string,
  context: ResolveContext,
  defaultResolve: Resolver,
): Promise<ResolveResult> {
  const { parentURL } = context;

  let url: URL | undefined;
  try {
    url = new URL(id);
  } catch {
    const resolveDir = parentURL ? dirname(fileURLToPath(parentURL)) : process.cwd();
    const path = await esbuild_resolve(id, resolveDir);
    if (path) {
      url = pathToFileURL(path);
    }
  }

  if (url && extname(url.pathname) in ExtToLoader) {
    return { url: url.href, shortCircuit: true, format: "module" };
  }

  return defaultResolve(id, context, defaultResolve);
}

export async function load(url: string, context: LoadContext, defaultLoad: Loader): Promise<LoadResult> {
  // Only handle file URLs.
  const path = url.startsWith("file:///") ? fileURLToPath(url) : "";
  const loader = ExtToLoader[extname(path)];

  if (loader) {
    const source = await readFile(path, "utf8");
    try {
      const { code, warnings } = await transform(source, {
        sourcefile: path,
        sourcemap: "inline",
        loader,
        target: `node${process.versions.node}`,
        format: "esm",
      });
      printErrorsAndWarnings({ warnings });
      return { source: code, shortCircuit: true, format: "module" };
    } catch (err) {
      if (err.errors) {
        printErrorsAndWarnings(err);
      }
      throw err;
    }
  }

  return defaultLoad(url, context, defaultLoad);
}

if (module.register) {
  process.setSourceMapsEnabled(true);
  module.register(`./loader.js?${Date.now()}`, import.meta.url);
}
