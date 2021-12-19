import { OnResolveArgs, Plugin } from "esbuild";

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
  const exclude = options.exclude ?? true;
  const exFilter = exclude === true ? CommonExts : exclude;

  return {
    name: "external",
    setup({ onResolve }) {
      onResolve({ filter }, args => {
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
