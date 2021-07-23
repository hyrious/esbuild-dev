import esbuild, { BuildOptions } from "esbuild";

/**
 * Bundle a file to see if it can run on the browser.
 * @example
 * platform("a.ts")
 * // a.ts: require("fs")
 * //=> "node"
 */
export async function platform(entry: string, options?: BuildOptions) {
  options = { entryPoints: [entry], ...options, bundle: true, write: false, logLevel: "silent" };
  delete options.format;
  try {
    await esbuild.build(options);
    return "browser";
  } catch {
    options.platform = "node";
    await esbuild.build(options);
    return "node";
  }
}
