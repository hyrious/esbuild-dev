import { TypedArray } from "./utils";

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
) => ResolveResult;

export async function resolve(
  id: string,
  context: ResolveContext,
  defaultResolve: Resolver
) {
  return defaultResolve(id, context, defaultResolve);
}

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
) => LoadResult;

export async function load(
  url: string,
  context: LoadContext,
  defaultLoad: Loader
) {
  return defaultLoad(url, context, defaultLoad);
}
