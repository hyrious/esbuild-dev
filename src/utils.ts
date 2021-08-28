import fs from "fs";
import os from "os";
import path from "path";

const PackageJSON = "package.json";

export function isFile(path: string) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

export function lookupFile(filename = PackageJSON, dir = process.cwd()): string | undefined {
  const file = path.join(dir, filename);
  if (isFile(file)) {
    return file;
  } else {
    const parent = path.dirname(dir);
    if (parent !== dir) {
      return lookupFile(filename, parent);
    }
  }
  return;
}

export const currentPackage = lookupFile(PackageJSON);

function parentPkgPath(pkgPath: string) {
  return path.join(pkgPath, `../../${PackageJSON}`);
}

function readDependencies(pkgPath: string, includeDev = true) {
  if (isFile(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...(includeDev && pkg.devDependencies),
    });
  } else {
    return [];
  }
}

function uniqSortedList<T>(array: T[]) {
  return array.flatMap((e, i, a) => (i && e === a[i - 1] ? [] : [e]));
}

export function lookupExternal(pkgPath = currentPackage, includeDev = true) {
  if (pkgPath) {
    const parent1 = parentPkgPath(pkgPath);
    const parent2 = parentPkgPath(parent1);
    const paths = uniqSortedList([pkgPath, parent1, parent2]);
    return paths.flatMap(p => readDependencies(p, includeDev));
  }
  return [];
}

export function tmpdir(pkgPath = currentPackage) {
  if (pkgPath) {
    const dir = path.join(path.dirname(pkgPath), "node_modules/.esbuild-dev");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  return os.tmpdir();
}
