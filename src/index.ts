import { ChildProcess, spawn, spawnSync } from "child_process";
import { watch } from "chokidar";
import { BuildIncremental, BuildResult, Service, startService } from "esbuild";
import debounce from "lodash.debounce";
import { basename, resolve } from "path";
import {
    findTargetDirectory,
    findUpperFile,
    getMessage,
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
    let outfile: string;
    try {
        ({ outfile } = await esbuild(filename));
    } catch {
        return;
    }

    const argv = ["--enable-source-maps", outfile, ...args];
    try {
        spawnSync(process.argv0, argv, {
            stdio: "inherit",
            cwd: process.cwd(),
            env: process.env,
        });
    } catch {
        console.error(getMessage(outfile, args));
    } finally {
        stopService();
    }
}

/**
 * Like `node-dev filename`, run file with watch and automatically restart.
 * @param filename - the file, usually ends with `.ts`
 */
export async function esbuildDev(filename: string, args: string[] = []) {
    let outfile: string;
    let result: BuildIncremental | null = null;
    let argv: string[];
    let child: ChildProcess | null = null;

    const rebuild = async (needRefresh = false) => {
        if (result && needRefresh) {
            result.rebuild.dispose();
            result = null;
        }

        try {
            if (result) {
                result = await result.rebuild();
            } else {
                ({ outfile, result } = await esbuild(filename, true));
                argv = ["--enable-source-maps", outfile, ...args];
            }
            return true;
        } catch {
            result = null;
            // esbuild already prints error message, don't show again
            return false;
        }
    };

    const stop = () => {
        if (child) {
            const dying = child;
            dying.kill("SIGTERM");
            setTimeout(() => {
                if (!dying.killed) dying.kill("SIGKILL");
            }, 1000);
            child = null;
        }
    };

    const restart = () => {
        stop();
        if (result) {
            try {
                child = spawn(process.argv0, argv, {
                    stdio: "inherit",
                    cwd: process.cwd(),
                    env: process.env,
                });
                child.on("close", (code) => {
                    const msg = "[esbuild-dev] child process stopped with code";
                    console.log(msg, code);
                    child = null;
                });
                child.on("error", () => {
                    console.error(getMessage(outfile, args));
                    stop();
                });
            } catch {
                console.error(getMessage(outfile, args));
                child = null;
            }
        }
    };

    // if the file is in a package, watch pkg.dependencies
    const pkgJson = findUpperFile(filename, "package.json");
    if (pkgJson) {
        watch(pkgJson).on("change", async () => {
            if (await rebuild(true)) restart();
        });
    }

    let deps = await resolveDependencies(filename);

    const watcher = watch([filename, ...deps]);
    watcher.on("ready", restart);
    watcher.on("change", debounce(update, 300));

    process.on("SIGINT", () => {
        stopService();
        process.exit();
    });

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

        if (await rebuild()) restart();
    }
}
