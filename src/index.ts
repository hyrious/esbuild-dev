import { BuildOptions } from "esbuild";
import url from "url";
import { build } from "./build";

/**
 * Build your file in esm format and import() it.
 * @example
 * try { await importFile('main.ts') }
 * catch { console.error('failed to import main.ts') }
 */
export async function importFile(name: string, options?: BuildOptions) {
  return import(url.pathToFileURL((await build(name, "esm", options)).outfile).toString());
}

/**
 * Build your file in cjs format and require() it.
 * @example
 * try { await requireFile('main.ts') }
 * catch { console.error('failed to require main.ts') }
 */
export async function requireFile(name: string, options?: BuildOptions) {
  return require((await build(name, "cjs", options)).outfile);
}

export { argsToBuildOptions, buildOptionsToArgs } from "./args";
export { external, ExternalPluginOptions } from "./external";
