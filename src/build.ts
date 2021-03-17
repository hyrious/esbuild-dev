import esbuild, { BuildOptions } from "esbuild";
import pkg from "../package.json";

const common = {
    external: Object.keys(pkg.dependencies),
    platform: "node",
    bundle: true,
    outdir: "dist",
    sourcemap: true,
} as const;

type Options = BuildOptions & { entryPoints: string[] };

async function build(options: Options) {
    await esbuild.build({ ...common, ...options });
    console.log(...options.entryPoints);
}

Promise.all([
    build({
        entryPoints: ["src/bin.ts"],
        minify: true,
        banner: { js: "#!/usr/bin/env node" },
    }),
    build({
        entryPoints: ["src/index.ts"],
    }),
]).catch(console.error);
