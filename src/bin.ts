import { ChildProcess, spawn } from "child_process";
import { watch } from "chokidar";
import { startService } from "esbuild";
import fs from "fs";
import tempy from "tempy";
import { dirtyResolveDeps, resolvePackageDeps } from ".";
import debounce from "lodash.debounce";

async function main() {
    const [filename, ...args] = process.argv.slice(2);
    const service = await startService();
    let child: ChildProcess | undefined;
    const stop = () => {
        if (child) {
            child.kill("SIGKILL");
            child = undefined;
        }
    };

    let deps = await dirtyResolveDeps(filename);
    const watcher = watch([filename, ...deps]);
    watcher.on("ready", run);
    watcher.on("change", debounce(update, 300));

    async function run() {
        const pkgJson = resolvePackageDeps(filename);
        if (pkgJson == null) {
            throw new Error("can not found package.json");
        }
        const pkg = JSON.parse(await fs.promises.readFile(pkgJson, "utf-8"));
        const dependencies = pkg["dependencies"] ?? {};
        const path = tempy.file({ extension: ".js" });
        try {
            await service.build({
                entryPoints: [filename],
                external: Object.keys(dependencies),
                platform: "node",
                bundle: true,
                outfile: path,
                minify: true,
                sourcemap: "inline",
            });
            stop();
            child = spawn(
                process.argv0,
                ["--enable-source-maps", path, ...args],
                { stdio: "inherit", cwd: process.cwd() }
            );
        } catch {
            stop();
        }
    }

    async function update() {
        await updateDeps();
        await run();
    }

    async function updateDeps() {
        const newDeps = await dirtyResolveDeps(filename);

        const toBeRemoved = new Set<string>();
        deps.forEach((e) => toBeRemoved.add(e));
        newDeps.forEach((e) => toBeRemoved.delete(e));
        watcher.unwatch(Array.from(toBeRemoved));

        const toBeAdded = new Set<string>();
        newDeps.forEach((e) => toBeAdded.add(e));
        deps.forEach((e) => toBeAdded.delete(e));
        watcher.add(Array.from(toBeAdded));

        deps = newDeps;
    }
}

if (process.argv.length < 3 || process.argv[2] === "--help") {
    console.log("usage: esbuild-dev main.ts --args-to-main.ts");
    process.exit();
}

main();
