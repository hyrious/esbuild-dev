import esbuild, { BuildOptions, Plugin } from "esbuild";

// npm:package-name-regex, removed $ to match nested files
const packageNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*/;

const plugin = (external: Set<string>): Plugin => ({
  name: "external",
  setup({ onResolve }) {
    onResolve({ filter: packageNameRegex, namespace: "file" }, args => {
      external.add(packageNameRegex.exec(args.path)![0]);
      return { path: args.path, external: true };
    });
  },
});

/**
 * Bundle a file to find out which libraries it is REALLY depending on.
 * The file's author should guarantee that the file can be bundled.
 * @example
 * external("a.ts", { loader: { ".css": "text" } })
 * // a.ts: import "esbuild"
 * //=> ["esbuild"]
 * NOTE: it only outputs DIRECT dependencies, not indirect ones.
 */
export async function external(entry: string, options?: BuildOptions) {
  options = { entryPoints: [entry], bundle: true, format: "esm", write: false, ...options };
  const libraries = new Set<string>();
  (options.plugins ??= []).push(plugin(libraries));
  await esbuild.build(options);
  return [...libraries];
}
