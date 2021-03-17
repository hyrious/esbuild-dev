import { ChildProcess, spawn, spawnSync } from "child_process";
import { watch } from "chokidar";
import esbuild, {
    BuildIncremental,
    BuildOptions,
    BuildResult
} from "esbuild";
import debounce from "lodash.debounce";
import { basename, resolve } from "path";
import {
    findTargetDirectory,
    findUpperFile,
    getMessage,
    resolveDependencies,
    resolveExternal
} from "./utils";

async function runEsbuild(
    filename: string,
    incremental: true,
    options?: BuildOptions
): Promise<{ outfile: string; result: BuildIncremental }>;

async function runEsbuild(
    filename: string,
    incremental?: false,
    options?: BuildOptions
): Promise<{ outfile: string; result: BuildResult }>;

async function runEsbuild(
    filename: string,
    incremental = false,
    options: BuildOptions = {}
) {
    const outdir = findTargetDirectory(filename);
    const outfile = resolve(outdir, basename(filename) + ".js");
    const external = await resolveExternal(filename);
    const result = await esbuild.build({
        entryPoints: [filename],
        external,
        platform: "node",
        target: "node14",
        bundle: true,
        outfile,
        sourcemap: true,
        incremental,
        ...options,
    });

    return { outfile, result };
}

/**
 * Like `node filename`, run file without watch.
 * @param filename - the file, usually ends with `.ts`
 */
export async function esbuildRun(
    filename: string,
    args: string[] = [],
    options?: BuildOptions
) {
    let outfile: string;
    try {
        ({ outfile } = await runEsbuild(filename, false, options));
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
    }
}

/**
 * Like `node-dev filename`, run file with watch and automatically restart.
 * @param filename - the file, usually ends with `.ts`
 */
export async function esbuildDev(
    filename: string,
    args: string[] = [],
    options?: BuildOptions
) {
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
                ({ outfile, result } = await runEsbuild(filename, true, options));
                argv = ["--enable-source-maps", outfile, ...args];
            }
            return true;
        } catch {
            result = null;
            // esbuild already prints error message, don't show again
            return false;
        }
    };

    const stop = () =>
        new Promise<void>((resolve) => {
            if (child) {
                const dying = child;
                dying.kill("SIGTERM");
                setTimeout(() => {
                    if (dying.killed) {
                        resolve();
                    } else {
                        setTimeout(() => {
                            if (!dying.killed) {
                                dying.kill("SIGKILL");
                            }
                            resolve();
                        }, 1000);
                    }
                }, 100);
                child = null;
            } else {
                resolve();
            }
        });

    const restart = async () => {
        await stop();
        if (result) {
            try {
                child = spawn(process.argv0, argv, {
                    stdio: "inherit",
                    cwd: process.cwd(),
                    env: process.env,
                });
                child.on("close", (code) => {
                    // prettier-ignore
                    console.log("[esbuild-dev] child process stopped with code", code);
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
            if (await rebuild(true)) await restart();
        });
    }

    let deps = await resolveDependencies(filename);

    const watcher = watch([filename, ...deps]);
    watcher.on("ready", restart);
    watcher.on("change", debounce(update, 300));

    process.on("SIGINT", () => {
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

        if (await rebuild()) await restart();
    }

    // kick start first run
    if (await rebuild()) await restart();
}
