import fs from "fs";
import builtinModules from "builtin-modules";
import { dirname, resolve } from "path";

function* scan(str: string, re: RegExp) {
    re = new RegExp(re.source, "g");
    let m: RegExpExecArray | null;
    do {
        m = re.exec(str);
        if (m) yield m;
    } while (m);
}

function* concatGen<A>(...gens: Generator<A>[]) {
    for (const gen of gens) {
        yield* gen;
    }
}

function isAlpha(chr: string) {
    return /^[A-Z]$/i.test(chr);
}

function tryIndexFile(dir: string) {
    for (const ext of [".js", ".mjs", ".jsx", ".ts", ".tsx"]) {
        if (fs.existsSync(dir + ext)) return dir + ext;
    }
    for (const ext of [".js", ".mjs", ".jsx", ".ts", ".tsx"]) {
        const path = resolve(dir, "index" + ext);
        if (fs.existsSync(path)) return path;
    }
}

/**
 * Find dependencies, the dirty way.
 * @param filename - full path of code file.
 */
export async function dirtyResolveDeps(filename: string) {
    const result: string[] = [];
    const queue = [filename];
    while (queue.length > 0) {
        let filename = queue.shift()!;
        const code = await fs.promises.readFile(filename, "utf-8");
        for (const { 1: mod } of concatGen(
            scan(code, /\bimport\b[^'"]+['"(]([^'")]+)/),
            scan(code, /\brequire\s*\(['"]([^'"]+)/)
        )) {
            // may match nothing
            if (!mod) continue;
            // builtin modules
            if (builtinModules.includes(mod.split("/", 2)[0])) continue;
            // node_modules
            if (isAlpha(mod[0])) continue;

            let dep = resolve(dirname(filename), mod);
            if (!fs.existsSync(dep) || fs.statSync(dep).isDirectory()) {
                const indexFile = tryIndexFile(dep);
                if (indexFile) dep = indexFile;
                else continue;
            }
            if (!result.includes(dep)) {
                queue.push(dep);
                result.push(dep);
            }
        }
    }
    return result;
}

/**
 * Find package.json.
 */
export function resolvePackageDeps(filename: string) {
    let lastdir = "";
    let dir = filename;
    while (lastdir !== dir) {
        lastdir = dir;
        dir = dirname(dir);
        const pkg = resolve(dir, "package.json");
        if (fs.existsSync(pkg)) {
            return pkg;
        }
    }
}
