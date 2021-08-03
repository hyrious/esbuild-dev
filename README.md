## @hyrious/esbuild-dev

Build and run your `script.ts`, like `ts-node` or `node-dev`

Require Node.js `>=14.8` to use `--enable-source-maps` and top-level await.

### Features

- ⚡ **_Fast_** with the help of esbuild, use `esbuild-dev` to substitute `ts-node`
  - pros: checkout [this repo's actions](https://github.com/hyrious/esbuild-dev/actions),
    `npm run build` done in 0.30s!
  - cons: you won't get any type checking at all
- 🐛 **_Easy to Debug_** with the help of node's `--enable-source-maps`
- ✨ **_No Magic_** other than esbuild itself. the author refuses to use any `require.extensions`-like things

### Usage

**CLI**: see [help.txt](./src/help.txt) for more info.

```bash
esbuild-dev [--cjs] [--watch] [--plugin:name] main.ts ...
esbuild-dev external [--bare] main.ts ...
```

**Library**

```ts
import {
  argsToBuildOptions,
  buildOptionsToArgs,
  external,
  importFile,
  requireFile,
} from "@hyrious/esbuild-dev";

await importFile("./a.ts");
// compiles a.ts to node_modules/.esbuild-dev/a.ts.mjs then import()

await requireFile("./a.ts");
// compiles a.ts to node_modules/.esbuild-dev/a.ts.js then require()

await external("./a.ts");
// if a.ts has `import "b"`, returns ["b"]

argsToBuildOptions(["--target=es6"]);
// { target: "es6" }

buildOptionsToArgs({ target: "es6" });
// ["--target=es6"]
```

### License

MIT @ [hyrious](https://github.com/hyrious)
