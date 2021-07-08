import esbuild, { BuildOptions } from "esbuild";
import path from "path";
import util from "util";
import error from "./error.txt";
import { lookupExternal, lookupFile, tmpdir } from "./utils";

type NodeVersion = "14" | "15" | "16";
type Target = `node${NodeVersion}`;

const nodeVersion = process.versions.node.split(".", 2)[0] as NodeVersion;
const target = `node${nodeVersion}` as Target;

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

const cliRE = /^--([-a-z]+)(?::([^=]+))?(?:=(.+))?$/;
const booleans = { true: true, false: false } as const;
export function argsToBuildOptions(args: string[]) {
  const buildOptions: BuildOptions = {};
  for (const arg of args) {
    const m = cliRE.exec(arg);
    if (m) {
      const [, slashKey, subKey, value] = m;
      const key = camelize(slashKey) as keyof BuildOptions;
      if (subKey && value) {
        // define, loader, banner, footer, stdin
        // their values are all string
        (buildOptions[key] ||= {} as any)[subKey] = value;
      } else if (subKey) {
        // pure, external, inject
        // their values are all string
        (buildOptions[key] ||= [] as any).push(subKey);
      } else if (value) {
        // resolveExtensions, mainFields, conditions, target
        // their values can have ',' to become array
        // others are boolean | string
        const bool: boolean | undefined = booleans[value as keyof typeof booleans];
        if (bool !== undefined) {
          // --a=false
          buildOptions[key] = bool as any;
        } else if (value.includes(",")) {
          // --a=b,c
          buildOptions[key] = value.split(",") as any;
        } else {
          // --a=b
          buildOptions[key] = value as any;
        }
      } else {
        buildOptions[key] = true as any;
      }
    } else {
      throw new Error(`unknown arg: ${arg}`);
    }
  }
  return buildOptions;
}

function camelize(s: string) {
  return s.split("-").reduce((a, b) => a + capitalize(b));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
