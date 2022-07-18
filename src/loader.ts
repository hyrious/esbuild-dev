import esbuild, { PartialMessage } from "esbuild";
import { promises } from "fs";
import { dirname, extname } from "path";
import { cwd, versions } from "process";
import { fileURLToPath, pathToFileURL, URL } from "url";
import { resolve as esbuildResolve } from "./build";
const read = promises.readFile;

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
  url: string;
}

export type Resolver = (
  id: string,
  context: ResolveContext,
  defaultResolve: Resolver
) => ResolveResult | Promise<ResolveResult>;

export interface LoadContext {
  format?: ResolveResult["format"];
}

export interface LoadResult {
  format: NonNullable<ResolveResult["format"]>;
  source: string | ArrayBuffer | TypedArray;
}

export type Loader = (
  url: string,
  context: LoadContext,
  defaultLoad: Loader
) => LoadResult | Promise<LoadResult>;

const ExtToLoader: Record<string, esbuild.Loader> = {
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
  defaultResolve: Resolver
): Promise<ResolveResult> {
  const { parentURL } = context;

  let url: URL | undefined;
  try {
    url = new URL(id);
  } catch {
    const resolveDir = parentURL ? dirname(fileURLToPath(parentURL)) : cwd();
    const path = await esbuildResolve(id, resolveDir);
    if (path) {
      url = pathToFileURL(path);
    }
  }

  if (url && extname(url.pathname) in ExtToLoader) {
    return { url: url.href, format: "module" };
  }

  return defaultResolve(id, context, defaultResolve);
}

export async function load(
  url: string,
  context: LoadContext,
  defaultLoad: Loader
): Promise<LoadResult> {
  // do a quick test if the url is not File URL, don't process it
  const path = url.startsWith("file:///") ? fileURLToPath(url) : "";
  const loader = ExtToLoader[extname(path)];

  if (loader) {
    const source = await read(path, "utf8");
    try {
      const { code, warnings } = await esbuild.transform(source, {
        sourcefile: path,
        sourcemap: "inline",
        loader,
        target: `node${versions.node}`,
        format: "esm",
      });
      printErrorsAndWarnings({ warnings });
      return { source: code, format: "module" };
    } catch (err) {
      if (err.errors) {
        printErrorsAndWarnings(err);
      }
      throw err;
    }
  }

  return defaultLoad(url, context, defaultLoad);
}
