import { build, Plugin } from "esbuild";
import { rmSync, promises } from "fs";
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
  entryPoints: ["src/bin.ts", "src/index.ts", "src/args.ts", "src/loader.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  splitting: true,
  external: ["esbuild"],
  outdir: "dist",
  minifySyntax: true,
  sourcemap: "both",
  outExtension: { ".js": ".mjs" },
  logLevel: "info",
  plugins: [shebang],
});

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  external: ["esbuild"],
  outdir: "dist",
  minifySyntax: true,
  sourcemap: "both",
  logLevel: "info",
});
