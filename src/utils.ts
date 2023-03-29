import { OnResolveArgs, Plugin } from "esbuild";

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
    // cspell:disable-next-line
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
