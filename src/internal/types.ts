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
) => ResolveResult;

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
