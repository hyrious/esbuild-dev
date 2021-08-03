import { Plugin } from "esbuild";
import { importFile } from ".";
import { currentPackage, isFile, lookupExternal } from "./utils";

function unwrap(mod: Function | any) {
  if (typeof mod === "function") {
    // prettier-ignore
    try { return mod() } catch {}
  }
  return mod;
}

function extractModule(mod: any) {
  if (mod.default) {
    return unwrap(mod.default);
  }
  const names = Object.keys(mod);
  if (names.length) {
    return unwrap(mod[names[0]]);
  }
}

export async function loadPlugin(name: string): Promise<Plugin | undefined> {
  if (isFile(name)) {
    return extractModule(await importFile(name));
  }

  if (currentPackage) {
    const installed = lookupExternal(currentPackage);
    for (const packageName of installed) {
      if (packageName.endsWith(name)) {
        return extractModule(await import(packageName));
      }
    }
  }

  return;
}
