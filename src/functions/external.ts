import esbuild, { BuildOptions, Plugin } from "esbuild";

// npm:package-name-regex, removed $ to match nested files
const packageNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*/;

interface ExternalPluginOptions {
  /**
   * passed to `onResolve`, indicating that the path is external
   * @default
   * RegExp(`^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*`)
   * // matches valid package name, see npm:package-name-regex
   */
  filter?: RegExp;

  /**
   * the regex / function to extract external name from `args.path`
   * @default
   * RegExp(`^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*`)
   * // matches valid package name, see npm:package-name-regex
   */
  mark?: RegExp | ((path: string) => string | undefined);
}

const createMarkFn = (mark: RegExp) => (path: string) => mark.exec(path)?.[0];

const externalPlugin = (result: Set<string>, options?: ExternalPluginOptions): Plugin => ({
  name: "external",
  setup({ onResolve }) {
    const filter = options?.filter ?? packageNameRegex;
    const mark = options?.mark ?? packageNameRegex;
    const markFn = typeof mark === "function" ? mark : createMarkFn(mark);

    onResolve({ filter, namespace: "file" }, args => {
      const ret = markFn(args.path);
      ret && result.add(ret);
      return { path: args.path, external: true };
    });

    // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/scan.ts

    // external url
    onResolve({ filter: /^(https?:)?\/\// }, ({ path }) => ({ path, external: true }));

    // data url
    onResolve({ filter: /^\s*data:/i }, ({ path }) => ({ path, external: true }));

    // css & json
    // prettier-ignore
    onResolve({ filter: /\.(css|less|sass|scss|styl|stylus|pcss|postcss|json)$/ }, ({ path }) => ({ path, external: true }));

    // assets
    // prettier-ignore
    onResolve({ filter: /\.(png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf|wasm)$/ }, ({ path }) => ({ path, external: true }));
  },
});

/**
 * Bundle a file to find out which libraries it is REALLY depending on.
 * This function does not depend on package.json.
 * The file's author should guarantee that the file can be bundled.
 *
 * NOTE: it only outputs DIRECT dependencies, not indirect ones.
 * @example
 * external("a.ts", {}, { loader: { ".css": "text" } })
 * // a.ts: import "esbuild"
 * //=> ["esbuild"]
 */
export async function external(
  entry: string,
  config?: ExternalPluginOptions,
  options?: BuildOptions
) {
  const result = new Set<string>();
  options = { entryPoints: [entry], bundle: true, format: "esm", write: false, ...options };
  (options.plugins ??= []).push(externalPlugin(result, config));
  await esbuild.build(options);
  return Array.from(result);
}
