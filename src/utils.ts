import builtinModules from "builtin-modules";
import fs from "fs";
import os from "os";
import { dirname, resolve } from "path";
import { inspect } from "util";
import message from "./message.txt";

/**
 * @example
 * for (const match of scan('123 456', /(\d+)/)) {
 *     console.log(+match[1])
 * }
 */
export function* scan(str: string, re: RegExp) {
    re = new RegExp(re.source, "g");
    let m: RegExpExecArray | null;
    do {
        m = re.exec(str);
        if (m) yield m;
    } while (m);
}

/**
 * @example
 * function *g(arr) {
 *     yield* arr;
 * }
 * for (const x of concatGen(g([1, 2]), g([3, 4]))) {
 *     console.log(x) // 1 2 3 4
 * }
 */
export function* concatGen<A>(...gens: Generator<A>[]) {
    for (const gen of gens) {
        yield* gen;
    }
}

/**
 * @example
 * isAlpha('a') // true
 */
export function isAlpha(chr: string) {
    return /^[A-Z]$/i.test(chr);
}

/**
 * @example
 * tryIndexFile('.') // path/to/here/index.js
 */
export function tryIndexFile(dir: string) {
    const exts = [".js", ".mjs", ".jsx", ".ts", ".tsx"];
    for (const ext of exts) {
        if (fs.existsSync(dir + ext)) return dir + ext;
    }
    for (const ext of exts) {
        const path = resolve(dir, "index" + ext);
        if (fs.existsSync(path)) return path;
    }
}

/**
 * @example
 * findUpperFile('path/to/some/main.ts', 'package.json')
 * // 'path/to/some/package.json'
 */
export function findUpperFile(filename: string, target: string) {
    let lastdir = "";
    let dir = filename;
    while (lastdir !== dir) {
        lastdir = dir;
        dir = dirname(dir);
        const pkg = resolve(dir, target);
        if (fs.existsSync(pkg)) {
            return pkg;
        }
    }
}

/**
 * @example
 * await resolveExternal('main.ts') // ['lodash', 'esbuild']
 */
export async function resolveExternal(filename: string) {
    const pkgJson = findUpperFile(filename, "package.json");
    if (!pkgJson) return [];
    try {
        const json = await fs.promises.readFile(pkgJson, "utf-8");
        const pkg = JSON.parse(json);
        return Object.keys(pkg.dependencies ?? {});
    } catch {
        return [];
    }
}

/**
 * @example
 * // main.ts: import 'a.ts'
 * await resolveDependencies('main.ts') // ['a.ts']
 */
export async function resolveDependencies(filename: string) {
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
 * Find somewhere to put dist.js.
 * @example
 * findTargetDirectory('main.ts')
 * // (file in package) 'path/to/node_modules/.esbuild-dev'
 * // (normal file) '/tmp'
 */
export function findTargetDirectory(filename: string) {
    const nodeModules = findUpperFile(filename, "node_modules");
    if (nodeModules) {
        const target = resolve(nodeModules, ".esbuild-dev");
        if (!fs.existsSync(target)) fs.mkdirSync(target);
        return target;
    }
    return os.tmpdir();
}

export function getMessage(file: string, args: string[]) {
    const argsString = args.map((e) => inspect(e)).join("");
    return message.replace("{file}", file).replace("{args}", argsString);
}
