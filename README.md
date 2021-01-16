## esbuild-dev

Just esbuild + ~~nodemon~~ chokidar, like `node-dev`.

Require Node.js `>=14` to use `--enable-source-maps`.

### Usage

```shell-session
npx @hyrious/esbuild-dev main.ts --args-passed-to-main.ts
npx @hyrious/esbuild-dev --run main.ts --args-passed-to-main.ts
```

With `--run`, it works like `node main.js`.

### License

MIT @ [hyrious](https://github.com/hyrious)
