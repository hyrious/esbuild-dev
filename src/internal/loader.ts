import * as types from "./types";
import process from "process";
import { Plugin } from "esbuild";
import { loadPlugins } from "./build";

function getPluginsFromEnv(): Promise<Plugin[]> {
  let longestKey = "__ESBUILD_PLUGINS__";
  while (process.env[longestKey]) {
    longestKey += "_";
  }
  const raw = process.env[longestKey.slice(0, -1)];
  return raw ? loadPlugins(JSON.parse(raw)) : Promise.resolve([]);
}

let plugins!: Plugin[];

export async function resolve(
  id: string,
  context: types.ResolveContext,
  defaultResolve: types.Resolver
) {
  plugins ||= await getPluginsFromEnv();

  return defaultResolve(id, context, defaultResolve);
}

export async function load(
  url: string,
  context: types.LoadContext,
  defaultLoad: types.Loader
) {
  plugins ||= await getPluginsFromEnv();

  return defaultLoad(url, context, defaultLoad);
}
