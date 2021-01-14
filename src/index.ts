import { spawnSync } from "child_process";
import { build } from "esbuild";
import { basename, resolve } from "path";
import { findTargetDirectory, resolveExternal } from "./utils";

/**
 * Like `node filename`, run file without watch.
 * @param filename - the file, usually ends with `.ts`
 */
export async function esbuildRun(filename: string, args: string[] = []) {
    const outdir = findTargetDirectory(filename);
    const outfile = resolve(outdir, basename(filename) + ".js");
    const external = await resolveExternal(filename);
    await build({
        entryPoints: [filename],
        external,
        platform: "node",
        bundle: true,
        outfile,
        sourcemap: true,
    });
    spawnSync(process.argv0, ["--enable-source-maps", outfile, ...args], {
        stdio: "inherit",
    });
}
