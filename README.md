## @hyrious/esbuild-dev

Build and run your `script.ts`, like `ts-node` or `node-dev`

Require Node.js `>=14.8` to use `--enable-source-maps`

### Features

- ⚡ **_Fast_** with the help of esbuild, use `esbuild-dev` to substitute `ts-node`
  - pros: checkout [this repo's actions](https://github.com/hyrious/esbuild-dev/actions),
    `npm run build` done in 0.30s!
  - cons: you won't get any type checking at all
- 🐛 **_Easy to Debug_** with the help of node's `--enable-source-maps`
- ✨ **_No Magic_** other than esbuild itself. the author refuses to use any `require.extensions`-like things

### Usage

**Run file**

```bash
npx @hyrious/esbuild-dev [--cjs] main.ts ...
```

By default, it compiles your file into esm format.

Add `--cjs` to use cjs format (e.g. using `require.resolve`).

**Watch file**

```bash
npx @hyrious/esbuild-dev [--cjs] --watch main.ts ...
```

**As library**

```ts
import { importFile } from "@hyrious/esbuild-dev";
const a = await importFile("./a.ts");
// compiles a.ts to node_modules/.esbuild-dev/a.ts.mjs then import()

const { requireFile } = require("@hyrious/esbuild-dev");
const a = await requireFile("./a.ts");
// compiles a.ts to node_modules/.esbuild-dev/a.ts.js then require()
```

### License

MIT @ [hyrious](https://github.com/hyrious)
