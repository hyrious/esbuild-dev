import fs from "fs";
import os from "os";
import path from "path";

export function isFile(path: string) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

export function lookupFile(filename = "package.json", dir = process.cwd()): string | undefined {
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

export const currentPackage = lookupFile("package.json");

export function lookupExternal(pkgPath = currentPackage, includeDev = true) {
  if (pkgPath) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...(includeDev && pkg.devDependencies),
    });
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
