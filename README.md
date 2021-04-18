## esbuild-dev

Just esbuild + chokidar, like `node-dev`.

Require Node.js `>=14` to use `--enable-source-maps`.

### Features

- ⚡ **_Fast_** with the help of esbuild, use `esbuild-dev` to substitute `ts-node`
  - pros: checkout [this repo's actions](https://github.com/hyrious/esbuild-dev/actions), `yarn build` done in 0.30s!
  - cons: you won't get any type checking at all
- 🐛 **_Easy to Debug_** with the help of node's `--enable-source-maps`
- **_No Magic_**. the author refuses to use any `require.extensions`-like things

### Usage

```shell-session
npx @hyrious/esbuild-dev main.ts --args-passed-to-main.ts
npx @hyrious/esbuild-dev --watch main.ts --args-passed-to-main.ts
npx @hyrious/esbuild-dev --build main.ts --args-passed-to-esbuild
```

With `--watch`, it works like `node-dev main.js`.

Without `--watch`, it works like `node main.js`.

With `--build`, it calls `esbuild --bundle ...`. By default, it includes these configs:

```ts
import type { BuildOptions } from "esbuild";
import pkg from "./package.json";
const defaultOptions: BuildOptions = {
  external: Object.keys(pkg.dependencies ?? {}),
  platform: "node",
  target: "node12",
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "dist",
};
```

You may want to append more configs, just add them after the filename. For example:

```shell-session
npx @hyrious/esbuild-dev --build main.ts --tree-shaking=ignore-annotations
```

Internally it follows a simple transform rule to convert command line args into configs:

| CLI               | JS                        | Description      |
| ----------------- | ------------------------- | ---------------- |
| `--a`             | `{ a: true }`             | truthy           |
| `--no-a`          | `{ a: false }`            | falsy            |
| `--a=1`           | `{ a: 1 }`                | numbers (no NaN) |
| `--a=b`           | `{ a: 'b' }`              | string           |
| `--a:b --a:c`     | `{ a: ['b', 'c'] }`       | array            |
| `--a:b=c --a:d=e` | `{ a: { b: 'c', d: 'e' }` | object           |

More examples:

**bin**

```shell-session
npx @hyrious/esbuild-dev --build main.ts --banner:js="#!/usr/bin/env node"
```

<dl>
    <dt>Note</dt>
    <dd>you don't have to write this if your entry file name includes "bin".</dd>
</dl>

### License

MIT @ [hyrious](https://github.com/hyrious)
