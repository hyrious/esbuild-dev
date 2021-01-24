## esbuild-dev

Just esbuild + ~~nodemon~~ chokidar, like `node-dev`.

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
```

With `--watch`, it works like `node-dev main.js`.

Without `--watch`, it works like `node main.js`.

### License

MIT @ [hyrious](https://github.com/hyrious)
