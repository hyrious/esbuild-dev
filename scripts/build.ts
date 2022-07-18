import { build, Plugin } from "esbuild";
import { promises, rmSync } from "fs";
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

// https://github.com/evanw/esbuild/issues/1747
const shaking: Plugin = {
  name: "shaking",
  setup({ onLoad, initialOptions: { format } }) {
    const __ESM__ = format === "esm";
    onLoad({ filter: /\b(build|index)\.ts$/ }, async args => {
      let code = await read(args.path, "utf8");
      for (let i = 0; (i = code.indexOf("if (__ESM__) {", i)) >= 0; ++i) {
        let ifLeft = code.indexOf("{", i);
        ifLeft = code.indexOf("\n", ifLeft) + 1;
        let ifRight = code.indexOf("} else {", ifLeft);

        let elseLeft = ifRight + "} else {".length;
        elseLeft = code.indexOf("\n", elseLeft) + 1;
        let elseRight = code.indexOf("}", elseLeft);

        if (__ESM__) {
          code =
            code.slice(0, elseLeft) +
            // replace with whitespace, so that sourcemap will point to correct position
            code.slice(elseLeft, elseRight).replace(/\S/g, " ") +
            code.slice(elseRight);
        } else {
          code =
            code.slice(0, ifLeft) +
            code.slice(ifLeft, ifRight).replace(/\S/g, " ") +
            code.slice(ifRight);
        }
      }
      return { contents: code, loader: "default" };
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
  sourcemap: true,
  outExtension: { ".js": ".mjs" },
  logLevel: "info",
  plugins: [shebang, shaking],
  target: ["node14.18.0", "node16.0.0"],
  define: {
    __ESM__: "true",
  },
}).catch(() => process.exit(1));

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  external: ["esbuild", "*/loader.mjs"],
  outdir: "dist",
  minifySyntax: true,
  sourcemap: true,
  logLevel: "info",
  plugins: [shaking],
  target: ["node14.18.0", "node16.0.0"],
  define: {
    __ESM__: "false",
  },
}).catch(() => process.exit(1));
