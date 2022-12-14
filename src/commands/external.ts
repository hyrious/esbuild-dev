import { BuildOptions } from "esbuild";
import { EsbuildDevExternalFlags, EsbuildFlags, parse } from "../args";
import { build, Format } from "../build";
import { external } from "../utils";
import { resolveMangleCache } from "./utils";

export async function externalCommand(entry: string, argsBeforeEntry: string[], argsAfterEntry: string[]) {
  const { _: _1, bare } = parse(argsBeforeEntry, EsbuildDevExternalFlags);
  const { _: _2, ...buildOptionsRaw } = parse(argsAfterEntry, EsbuildFlags);

  void _1, _2; // ignored

  const buildOptions = buildOptionsRaw as BuildOptions & { format: Format };
  delete buildOptions.platform;
  buildOptions.format ||= "esm";
  buildOptions.target ||= "esnext";
  resolveMangleCache(buildOptions);

  const collected: Record<string, true> = {};
  const onResolve = ({ path }: { path: string }) => {
    collected[path] = true;
  };
  (buildOptions.plugins ||= []).push(external({ onResolve }));

  try {
    await build(entry, buildOptions);
    const result = Object.keys(collected);
    console.log(bare ? result.join("\n") : result);
  } catch {}
}
