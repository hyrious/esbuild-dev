import { BuildOptions } from "esbuild";
import url from "url";
import { build } from "./build";

/**
 * @example
 * try { await importFile('main.ts') }
 * catch { console.error('failed to import main.ts') }
 */
export async function importFile(name: string, options?: BuildOptions) {
  return import(url.pathToFileURL((await build(name, "esm", options)).outfile).toString());
}

/**
 * @example
 * try { await requireFile('main.ts') }
 * catch { console.error('failed to require main.ts') }
 */
export async function requireFile(name: string, options?: BuildOptions) {
  return require((await build(name, "cjs", options)).outfile);
}

export { argsToBuildOptions } from "./build";
