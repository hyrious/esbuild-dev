import esbuild, { BuildOptions } from "esbuild";
import path from "path";
import util from "util";
import error from "./error.txt";
import { lookupExternal, lookupFile, tmpdir } from "./utils";

const nodeVersion = process.versions.node.split(".", 3).slice(0, 2);
const target = `node${nodeVersion.join(".")}`;

export type Format = "esm" | "cjs";
const extname: Record<Format, ".mjs" | ".js"> = { esm: ".mjs", cjs: ".js" };

export async function build(entry: string, format: Format = "esm", options?: BuildOptions) {
  const dirname = path.dirname(entry);
  const pkgPath = lookupFile("package.json", dirname);
  const outfile = path.join(tmpdir(), entry + extname[format]);
  const result = await esbuild.build({
    entryPoints: [entry],
    external: lookupExternal(pkgPath),
    platform: "node",
    target,
    format,
    bundle: true,
    sourcemap: true,
    outfile,
    ...options,
  });
  return { outfile, result };
}

export function errorMessage(file: string, args: string[]) {
  const template = { file, args: args.map(e => util.inspect(e)).join(" ") };
  return error.replace(/{(\w+)}/g, (_, key: "file" | "args") => template[key] || "");
}
