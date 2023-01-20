## @hyrious/esbuild-dev

Build and run your `script.ts`, like `ts-node` or `node-dev`.

Require Node.js `^14.18 || >=16` to use `--enable-source-maps` and top-level await.

### Features

- ⚡ **_Fast_** with the help of esbuild, use `esbuild-dev` to substitute `ts-node`
  - pros: checkout [this repo's actions](https://github.com/hyrious/esbuild-dev/actions),
    `npm run build` done in 0.30s!
  - cons: you won't get any type checking at all
- 🐛 **_Easy to Debug_** with the help of node's `--enable-source-maps`
- ✨ **_No Magic_** other than esbuild itself. the author refuses to use any `require.extensions`-like things

### Install

```bash
npm i -g @hyrious/esbuild-dev esbuild
```

> **Note:** esbuild is a peer dependency!

### Usage

```bash
esbuild-dev [--watch] main.ts
```

[Read the docs to learn more.](https://hyrious.me/esbuild-dev)

### Develop

The source codes in the project is carefully written in a style that esbuild won't generate interop helpers. Refer [esbuild#1831](https://github.com/evanw/esbuild/issues/1831#issuecomment-992909043) to learn how.

### License

MIT @ [hyrious](https://github.com/hyrious)
