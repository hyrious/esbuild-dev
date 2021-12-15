import { build, Plugin } from "esbuild";
import { rmSync, promises, readdirSync } from "fs";
import { join } from "path";
const read = promises.readFile;

rmSync("dist", { recursive: true, maxRetries: 3, force: true });

const shebang: Plugin = {
  name: "shebang",
  setup({ onLoad }) {
    onLoad({ filter: /bin\.ts$/ }, async args => {
      const contents =
        "#!/usr/bin/env node\n" + (await read(args.path, "utf8"));
      return { contents, loader: "default" };
    });
  },
};

await build({
  entryPoints: readdirSync("src")
    .filter(path => path.endsWith(".ts") && !path.endsWith(".d.ts"))
    .map(path => join("src", path)),
  bundle: true,
  platform: "node",
  format: "esm",
  splitting: true,
  external: ["esbuild"],
  outdir: "dist",
  minifySyntax: true,
  sourcemap: true,
  outExtension: { ".js": ".mjs" },
  logLevel: "info",
  plugins: [shebang],
  define: {
    __ESM__: "true",
  },
});

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  external: ["esbuild"],
  outdir: "dist",
  minifySyntax: true,
  sourcemap: true,
  logLevel: "info",
  define: {
    __ESM__: "false",
  },
});
