import { env } from "process";
import { Plugin } from "esbuild";
import * as types from "./internal/types";
import { loadPlugins } from "./internal/build";

function getPluginsFromEnv(): Promise<Plugin[]> {
  let longestKey = "__ESBUILD_PLUGINS__";
  while (env[longestKey]) {
    longestKey += "_";
  }
  const raw = env[longestKey.slice(0, -1)];
  return raw ? loadPlugins(JSON.parse(raw)) : Promise.resolve([]);
}

let plugins = await getPluginsFromEnv();

export async function resolve(
  id: string,
  context: types.ResolveContext,
  defaultResolve: types.Resolver
) {
  return defaultResolve(id, context, defaultResolve);
}

export async function load(
  url: string,
  context: types.LoadContext,
  defaultLoad: types.Loader
) {
  return defaultLoad(url, context, defaultLoad);
}
