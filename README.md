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

**CLI**:

```bash
Usage:
  esbuild-dev [--cjs] [--watch] [--plugin:name] main.ts ...
  esbuild-dev external [--bare] main.ts ...

Options:
  --cjs                 By default, it compiles your file in ESM format.
                        This will change it to CJS format. For example,
                        `__dirname` can only be used in CJS, and
                        `import.meta` can only be accessed in ESM.

  --watch               Enable watch mode.
  alias: -w

  --plugin:name         Load esbuild plugins. For example, `--plugin:style`
  alias: -p             will try to load `style` package in your project.
                        This option can not be used outside of a package.

Sub Commands:
  external              Show potential external libraries of a file.
                        Additional arguments are passed to build options.

    --bare              Use bare format (one name per line, no quotes).
    alias: -b
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
