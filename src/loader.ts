import esbuild from "esbuild";
import { getPluginsFromEnv } from "./internal/build";
import * as types from "./internal/types";

let plugins = await getPluginsFromEnv();
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
let stash = new Map<string, any>();

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
  const { conditions, parentURL } = context;

  for (const { name, options, callback } of onResolveCallbacks) {
  }

  return defaultResolve(id, context, defaultResolve);
}

export async function load(
  url: string,
  context: types.LoadContext,
  defaultLoad: types.Loader
): Promise<types.LoadResult> {
  return defaultLoad(url, context, defaultLoad);
}
