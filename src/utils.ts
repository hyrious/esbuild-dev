import { OnResolveArgs, Plugin } from "esbuild";
import { readFile } from "fs/promises";
import { dirname } from "path";
import { pathToFileURL } from "url";

export function noop() {}

export function isObj(o: any): o is Record<string, any> {
  return typeof o === "object" && o !== null;
}

export function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

export interface ExternalPluginOptions {
  /**
   * Passed to `onResolve()`, mark them as external.
   * @default /^[\w@][^:]/
   */
  filter?: RegExp;

  /**
   * Called on each external id.
   * @example
   * external({ onResolve(args) { externals.push(args.path) } })
   */
  onResolve?: (args: OnResolveArgs) => void;

  /**
   * Force include these paths into bundle.
   */
  include?: string[];

  /**
   * Silently exclude some common file extensions.
   * @default true
   */
  exclude?: boolean | RegExp;
}

export function external(options: ExternalPluginOptions = {}): Plugin {
  const CommonExts =
    /\.(css|less|sass|scss|styl|stylus|pcss|postcss|json|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf|wasm)$/;

  const filter = options.filter ?? /^[\w@][^:]/;
  const callback = options.onResolve ?? noop;
  const include = options.include ?? [];
  const exclude = options.exclude ?? true;
  const exFilter = exclude === true ? CommonExts : exclude;

  return {
    name: "external",
    setup({ onResolve }) {
      onResolve({ filter }, args => {
        if (include.includes(args.path)) return null;
        callback(args);
        return { path: args.path, external: true };
      });
      if (exFilter) {
        onResolve({ filter: exFilter }, ({ path }) => {
          return { path, external: true };
        });
      }
    },
  };
}

export interface ReplaceImportMetaOptions {
  /**
   * Passed to `onLoad()`.
   * @default /\.[jt]s$/
   */
  filter?: RegExp;
}

/**
 * Replace `import.meta.url` and `__dirname`, `__filename` with absolute path.
 * Taken from https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts
 */
export function replaceImportMeta(
  options: ReplaceImportMetaOptions = {}
): Plugin {
  const filter = options.filter ?? /\.[jt]s$/;

  return {
    name: "replace-import-meta",
    setup({ onLoad }) {
      onLoad({ filter }, async args => {
        const contents = await readFile(args.path, "utf8");
        const import_meta_url = JSON.stringify(pathToFileURL(args.path).href);
        return {
          loader: "default",
          contents: contents
            .replace(/\bimport\.meta\.url\b/g, import_meta_url)
            .replace(/\b__dirname\b/g, JSON.stringify(dirname(args.path)))
            .replace(/\b__filename\b/g, JSON.stringify(args.path)),
        };
      });
    },
  };
}
