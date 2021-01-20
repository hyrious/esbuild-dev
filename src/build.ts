import { startService, Service, BuildOptions } from "esbuild";
import pkg from "../package.json";

const common = {
    external: Object.keys(pkg.dependencies),
    platform: "node",
    bundle: true,
    outdir: "dist",
    sourcemap: true,
} as const;

type Options = BuildOptions & { entryPoints: string[] };

async function build(service: Service, options: Options) {
    await service.build({ ...common, ...options });
    console.log(...options.entryPoints);
}

async function main() {
    const service = await startService();
    await Promise.all([
        build(service, {
            entryPoints: ["src/bin.ts"],
            minify: true,
            banner: "#!/usr/bin/env node",
        }),
        build(service, {
            entryPoints: ["src/index.ts"],
        }),
    ]);
    service.stop();
}

main();
