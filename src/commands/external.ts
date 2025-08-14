import type { BuildOptions } from "esbuild";
import { EsbuildDevExternalFlags, EsbuildFlags, parse } from "../args.js";
import { type Format, build, external } from "../index.js";
import { resolveMangleCache } from "./utils";

export async function externalCommand(
  entry: string,
  argsBeforeEntry: string[],
  argsAfterEntry: string[],
): Promise<void> {
  const { _: _1, bare, ...externalOptions } = parse(argsBeforeEntry, EsbuildDevExternalFlags);
  const { _: _2, ...buildOptionsRaw } = parse(argsAfterEntry, EsbuildFlags);

  const buildOptions = buildOptionsRaw as BuildOptions & { format: Format };
  delete buildOptions.platform;
  buildOptions.format ||= "esm";
  buildOptions.target ||= "esnext";
  resolveMangleCache(buildOptions);

  const collected: Record<string, true> = {};
  const onResolve = ({ path }: { path: string }) => {
    collected[path] = true;
  };
  (buildOptions.plugins ||= []).push(external({ ...externalOptions, onResolve }));

  try {
    await build(entry, buildOptions);
    const result = Object.keys(collected);
    console.log(bare ? result.join("\n") : result);
  } catch {}
}
