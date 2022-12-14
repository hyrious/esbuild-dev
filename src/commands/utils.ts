import { BuildOptions } from "esbuild";
import { readFileSync } from "fs";

export function resolveMangleCache(options: BuildOptions) {
  if (typeof options.mangleCache === "string") {
    try {
      options.mangleCache = JSON.parse(readFileSync(options.mangleCache, "utf8"));
    } catch (err) {
      console.error(err);
      delete options.mangleCache;
    }
  }
}
