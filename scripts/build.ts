import { build, Plugin } from "esbuild";
import { chmodSync, rmSync } from "fs";
import { readFile } from "fs/promises";
import { external } from "@hyrious/esbuild-plugin-external";

rmSync("dist", { recursive: true, maxRetries: 3, force: true });

const shebang: Plugin = {
  name: "shebang",
  setup({ onLoad, onEnd }) {
    onLoad({ filter: /bin\.ts$/ }, async args => {
      const contents = "#!/usr/bin/env node\n" + (await readFile(args.path, "utf8"));
      return { contents, loader: "default" };
    });
    onEnd(() => {
      chmodSync("dist/bin.js", 0o755);
    });
  },
};

await build({
  entryPoints: ["src/bin.ts", "src/index.ts", "src/args.ts", "src/loader.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["esbuild"],
  outdir: "dist",
  sourcemap: true,
  sourcesContent: false,
  dropLabels: ["CJS"],
  logLevel: "info",
  plugins: [
    shebang,
    external({
      auto: [{ filter: /\.js$/ }],
    }),
  ],
  target: ["node14.18.0", "node16.0.0"],
  define: {
    __ESM__: "true",
  },
  logOverride: {
    "empty-import-meta": "silent",
  },
}).catch(() => process.exit(1));

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  external: ["esbuild", "*/loader.js"],
  outdir: "dist",
  sourcemap: true,
  sourcesContent: false,
  dropLabels: ["ESM"],
  outExtension: { ".js": ".cjs" },
  logLevel: "info",
  target: ["node14.18.0", "node16.0.0"],
  define: {
    __ESM__: "false",
  },
  logOverride: {
    "empty-import-meta": "silent",
  },
}).catch(() => process.exit(1));
