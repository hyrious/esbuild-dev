import { OnResolveArgs, Plugin } from "esbuild";
import { createMatch } from "./glob";

export function noop() {}

export function isObj(o: any): o is Record<string, any> {
  return typeof o === "object" && o !== null;
}

export function isEmpty(opt?: any) {
  if (!opt) return true;
  for (const key in opt) {
    if (opt[key]) return false;
  }
  return true;
}

export function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

export function block<T = void>() {
  let resolve: (v: T) => void;
  let reject: (e: any) => void;
  let promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

export function splitSearch(path: string) {
  let i = path.indexOf("?");
  if (i < 0) return [path, ""];
  return [path.slice(0, i), path.slice(i)];
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
   * Reject these paths from included paths.
   */
  exclude?: string[];

  /**
   * Silently exclude some common file extensions.
   * @default true
   */
  ignore?: boolean | RegExp;
}

export function external(options: ExternalPluginOptions = {}): Plugin {
  // cspell:disable-next-line
  // prettier-ignore
  const CommonExts = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss|json|apng|png|jpe?g|jfif|pjpeg|pjp|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac|opus|mov|m4a|vtt|woff2?|eot|ttf|otf|webmanifest|pdf|txt|wasm)(\?.*)?$/;

  const filter = options.filter ?? /^[\w@][^:]/;
  const callback = options.onResolve ?? noop;
  const include = options.include?.map(expr => createMatch(expr)) ?? [];
  const exclude = options.exclude?.map(expr => createMatch(expr)) ?? [];
  if (include.length === 0 && exclude.length > 0) {
    include.push(() => true);
  }
  const ignore = options.ignore ?? true;
  const exFilter = ignore === true ? CommonExts : ignore;

  return {
    name: "external",
    setup({ onResolve }) {
      onResolve({ filter }, args => {
        // Always exclude node builtins.
        if (args.path.startsWith("node:")) {
          return { path: args.path, external: true };
        }
        if (exclude.some(match => match(args.path))) {
          callback(args);
          return { path: args.path, external: true };
        }
        if (include.some(match => match(args.path))) {
          return null;
        }
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
