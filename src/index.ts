import { ChildProcess, spawn, spawnSync } from "child_process";
import { watch } from "chokidar";
import { BuildIncremental, BuildResult, Service, startService } from "esbuild";
import debounce from "lodash.debounce";
import { basename, resolve } from "path";
import {
    findTargetDirectory,
    findUpperFile,
    resolveDependencies,
    resolveExternal,
} from "./utils";

let esbuildService: Service | undefined;

async function ensureService() {
    if (!esbuildService) {
        esbuildService = await startService();
    }
    return esbuildService!;
}

function stopService() {
    if (esbuildService) {
        esbuildService.stop();
        esbuildService = undefined;
    }
}

async function esbuild(
    filename: string,
    incremental: true
): Promise<{ outfile: string; result: BuildIncremental }>;

async function esbuild(
    filename: string,
    incremental?: false
): Promise<{ outfile: string; result: BuildResult }>;

async function esbuild(filename: string, incremental = false) {
    const service = await ensureService();

    const outdir = findTargetDirectory(filename);
    const outfile = resolve(outdir, basename(filename) + ".js");
    const external = await resolveExternal(filename);
    const result = await service.build({
        entryPoints: [filename],
        external,
        platform: "node",
        target: "node14",
        bundle: true,
        outfile,
        sourcemap: true,
        incremental,
    });

    return { outfile, result };
}

/**
 * Like `node filename`, run file without watch.
 * @param filename - the file, usually ends with `.ts`
 */
export async function esbuildRun(filename: string, args: string[] = []) {
    const { outfile } = await esbuild(filename);
    const argv = ["--enable-source-maps", outfile, ...args];
    spawnSync(process.argv0, argv, {
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env,
    });
    stopService();
}

/**
 * Like `node-dev filename`, run file with watch and automatically restart.
 * @param filename - the file, usually ends with `.ts`
 */
export async function esbuildDev(filename: string, args: string[] = []) {
    let { outfile, result } = await esbuild(filename, true);

    const argv = ["--enable-source-maps", outfile, ...args];

    // if the file is in a package, watch pkg.dependencies
    const pkgJson = findUpperFile(filename, "package.json");
    if (pkgJson) {
        watch(pkgJson).on("change", async () => {
            result.rebuild.dispose();
            ({ result } = await esbuild(filename, true));
        });
    }

    let child: ChildProcess | undefined;

    const rubbish = new Set<Promise<void>>();

    const stop = (ms = 1000) => {
        if (child) {
            const tobeKilled = child;
            tobeKilled.on("exit", (code) => {
                if (code !== 0) {
                    console.log(
                        "child process",
                        tobeKilled.pid,
                        "exited with code",
                        code
                    );
                }
            });
            const task = new Promise<void>((resolve) => {
                tobeKilled.kill("SIGTERM");
                setTimeout(() => {
                    if (!tobeKilled.killed) {
                        tobeKilled.kill("SIGKILL");
                    }
                    resolve();
                }, ms);
            }).then(() => {
                rubbish.delete(task);
            });
            rubbish.add(task);
            child = undefined;
        }
    };

    const waitForRubbishClean = async () => {
        const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
        while (rubbish.size > 0) await delay(100);
    };

    let deps = await resolveDependencies(filename);

    const watcher = watch([filename, ...deps]);
    watcher.on("ready", run);
    watcher.on("change", debounce(update, 300));

    process.on("SIGINT", async () => {
        await waitForRubbishClean();
        process.exit();
    });

    async function run() {
        stop();
        try {
            child = spawn(process.argv0, argv, {
                stdio: "inherit",
                cwd: process.cwd(),
                env: process.env,
            });
        } catch (e) {
            console.error(e);
            stop();
        }
    }

    async function update() {
        const newDeps = await resolveDependencies(filename);

        const toBeRemoved = new Set<string>();
        deps.forEach((e) => toBeRemoved.add(e));
        newDeps.forEach((e) => toBeRemoved.delete(e));
        watcher.unwatch(Array.from(toBeRemoved));

        const toBeAdded = new Set<string>();
        newDeps.forEach((e) => toBeAdded.add(e));
        deps.forEach((e) => toBeAdded.delete(e));
        watcher.add(Array.from(toBeAdded));

        result = await result.rebuild();
        await run();
    }
}
