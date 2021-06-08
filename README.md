## @hyrious/esbuild-dev

Just esbuild + chokidar, like `node-dev`.

Require Node.js `>=14` to use `--enable-source-maps`.

### Features

- ⚡ **_Fast_** with the help of esbuild, use `esbuild-dev` to substitute `ts-node`
  - pros: checkout [this repo's actions](https://github.com/hyrious/esbuild-dev/actions), `npm run build` done in 0.30s!
  - cons: you won't get any type checking at all
- 🐛 **_Easy to Debug_** with the help of node's `--enable-source-maps`
- **_No Magic_**. the author refuses to use any `require.extensions`-like things

### Usage

**Run file**

```bash
npx @hyrious/esbuild-dev [--cjs] main.ts [--args]
```

By default, it compiles your file into esm format.

Add `--cjs` before the file name to use cjs format (if you want to use `require.resolve`).

**Watch file**

```bash
npx @hyrious/esbuild-dev [--cjs] --watch main.ts [--args]
```

**Build (bundle) file**

```bash
npx @hyrious/esbuild-dev --build main.ts [--args-for-esbuild]
```

### Details

By default, `--build` uses this config:

```ts
import type { BuildOptions } from 'esbuild'
import pkg from './package.json'
const defaultOptions: BuildOptions = {
  external: Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  platform: 'node',
  target: 'node12',
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'dist',
}
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

### License

MIT @ [hyrious](https://github.com/hyrious)
