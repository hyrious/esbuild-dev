# Changelog

## Unreleased

- **refactor**: Disable `--cache` by default, it might be too aggressive.

## 0.10.10

- **feat**: Add `--cwd` to change the working directory, it also affects the cache file logic.

## 0.10.9

- **chore**: Generate type definitions.

## 0.10.8

- **feat**: Add `--cache` and enable it by default.
- **refactor**: Alias `temp` to `tmp`.

## 0.10.7

- **fix**: Path after `--import` should be an import specifier.

## 0.10.6

- **feat**: Shim `import.meta.{dirname,filename}`.
- **refactor**: Use `"type": "module"` and change main file extension to `.js`.
- **refactor**: Use `--import` instead of `--loader` when possible.

## 0.10.5

- **feat**: Add `temp` command to print the output directory.
- **feat**: Add `--node` to append node options instead of relying on `NODE_OPTIONS` env.

## 0.10.4

- **feat**: Add `--drop-labels` to `EsbuildFlags`.

## 0.10.3

- **feat**: `importFile()` and `requireFile()` can accept path with search params.\
  This is useful when you are running them on the same file but the file has changed since last import.
  For example you can make an esbuild svelte **ssr** plugin that even works in watch mode:

  ```js
  onResolve({ filter: /index\.html$/ }, args => {
    return { path: args.path, namespace: "svelte-ssr" };
  });

  onLoad({ filter: /()/, namespace: "svelte-ssr" }, async args => {
    const svelteFile = findSvelteFile(args.path);
    const { default: App } = await importFile(svelteFile + "?t=" + Date.now(), {
      plugins: [svelte({ compilerOptions: { css: "none", generate: "ssr", hydratable: true } })],
    });
    const { html, head } = App.render();
    return { contents: renderHTML(args.path, { html, head }), loader: "copy" };
  });
  ```

- **feat**: Add `--line-limit` to `EsbuildFlags`.

## 0.10.2

- **fix**: Wait for first build in watch mode.
- **fix**: Don't run output when there's error in build result.

## 0.10.1

- **refactor**: Await `context.watch()`.
- **fix**: Keep shebang when prepending shims.

## 0.10.0

- **refactor!**: Integrate esbuild 0.17's `context` api.

## 0.9.1

- **refactor**: Lock `esbuild` to `<=0.16` to avoid breaking changes.

## 0.9.0

- **feat**: Add `--packages` to `EsbuildFlags`.
- **feat!**: Use `--packages=external` if possible and no `--include` is provided.

## 0.8.7

- **feat**: Add `--alias` to `EsbuildFlags`.

## 0.8.6

- **refatcor**: Hack around `--shims` to make it work with `--plugin`.

## 0.8.5

- **refactor**: Improve `--shims` (enabled by default) behavior.\
  Again, it has a caveat that `--plugin` cannot be used with `--shims`.

## 0.8.4

- **feat**: Add `--jsx-side-effects` to `EsbuildFlags`.

## 0.8.3

- **feat**: Add `--include:name` to force include a package in the bundle.

## 0.8.2

- **feat**: Add `--jsx-import-source` and `--jsx-dev` to `EsbuildFlags`.

## 0.8.1

- **fix**: Add `shortCircuit` to loader api.

## 0.8.0

- **refactor**: Correctly transform `--supported` to record of booleans.

- **refactor!**: Enable `--shims` by default. You can disable it by `--shims=false`.\
  Caveats: `--shims` cannot be used with `--plugin`, because one `onLoad` callback can only
  be called once per file.

- **refactor**: Temporary built file paths now have replaced `/` to `+` for better debug purpose.

## 0.7.7

- **feat**: Add `--supported` and `--log-override` to `EsbuildFlags`.

## 0.7.6

- **feat**: Add `--shims` to polyfill `import.meta.url` and `__dirname`, `__filename`.\
  Below is the difference with/without this option:

  **without `--shims`**:

  ```js
  $ cat test/index.ts
  // WARN: do not use these words as key
  console.log({ import_meta_url: import.meta.url } as any);
  console.log({ filename: __filename } as any);

  $ esbuild-dev test/index.ts
  { import_meta_url: 'file:///Users/hyrious/esbuild-dev/node_modules/.esbuild-dev/test/index.ts.js' }
  /Users/hyrious/esbuild-dev/test/index.ts:3
  console.log({ filename: __filename } as any);
                          ^
  ReferenceError: __filename is not defined in ES module scope

  $ esbuild-dev --cjs test/index.ts
  { import_meta_url: undefined }
  { filename: '/Users/hyrious/esbuild-dev/node_modules/.esbuild-dev/test/index.ts.cjs' }
  ```

  **with `--shims`**:

  ```js
  $ esbuild-dev --shims test/index.ts
  { import_meta_url: 'file:///Users/hyrious/esbuild-dev/test/index.ts' }
  { filename: '/Users/hyrious/esbuild-dev/test/index.ts' }

  $ esbuild-dev --cjs --shims test/index.ts
  { import_meta_url: 'file:///Users/hyrious/esbuild-dev/test/index.ts' }
  { filename: '/Users/hyrious/esbuild-dev/test/index.ts' }
  ```

## 0.7.5

- **feat**: Forward child process exit code. (#19)\
  This feature was contributed by [@tmueller](https://github.com/tmueller).

## 0.7.4

- **fix**: Transform `mangle` related flags to RegExp.\
  This is still hand-written because there's no obvious way to generate it.

## 0.7.3

- **feat**: Add `mangle` related flags to `EsbuildFlags`.\
  Now this list is generated.

## 0.7.2

- **feat**: Add `--drop:` to `EsbuildFlags`.
- **feat**: Add `rs` in watch mode to force rebuild and run.

## 0.7.1

- **fix**: (loader) Ignore url that are not file url in `load()`.

## 0.7.0

- **feat**: Add `--loader` to run file with `--experimental-loader`.\
  Note that it does not support esbuild plugins.

## 0.6.2

- **fix**: Fix using plugin from local file.
- **package**: Peer dependency `esbuild` &rarr; `*`.

## 0.6.0

- **dep**: Move esbuild to peer dependencies.\
  If you can not use this package at global environment, try `npm i -g esbuild`.

- **refactor**: You can pass esbuild options through command line.

  ```bash
  usage: esbuild-dev [esbuild options | esbuild-dev options] entry [...args]

  esbuild-dev --cjs --unknown-flag1 --jsx-factory=h main.ts --unknown-flag2
  # same as `node main.js --unknown-flag1 --unknown-flag2`
  ```

  Internally, it shares the [same](https://github.com/evanw/esbuild/blob/master/pkg/cli/cli_impl.go) processing logic as esbuild's.

- **package**: Target `node14.8` &rarr; `node16.13`.

## 0.5.2

- **dep**: Upgrade esbuild to 0.14.x.\
  This is **not** a minor version upgrade. I guess there won't be any issue.
  Finally I will find a way to make esbuild a peer dependency, so that their versions can be decoupled.

## 0.5.1

- **refactor**: It will log warnings about not able to load plugins.

## 0.5.0

- **dep**: Upgrade esbuild to 0.13.x.

## 0.4.8

- **fix**: Missing args.d.ts in release.

## 0.4.7

- **fix**: Make it work in workspace by looking up 2 parent's package.json.
- **types**: Include args.d.ts in root path.

## 0.4.6

- **fix**: Fix a conversion bug in `buildOptionsToArgs()`.
- **refactor**: Now errors throw-ed by esbuild will not be printed twice.

## 0.4.5

- **fix**: All flags after the entry are passed to script.\
  Previously, all flags are processed despite the side of them. This leads to a bad behavior:

  ```bash
  esbuild-dev --cjs --unknown-flag main.ts --help
  # prints esbuild-dev's help instead of calling `node main.js --help`
  # same as `esbuild-dev --help`
  ```

  Now it was fixed. Flags after the entry are always passed to script.
  Note that unknown flags are also passed to the script for loose rule.

  ```bash
  esbuild-dev --cjs --unknown-flag main.ts --help
  # same as `node main.js --unknown-flag --help`
  ```

- **refactor**: `argsToBuildOptions` and `buildOptionsToArgs` now accept & return
  both `BuildOptions` and `TransformOptions`.

## 0.4.4

- **refactor**: Split esm dist files, so that `args()` can be used without importing esbuild.\
  Note: you may have to add such shim.d.ts for correct types:

  ```ts
  declare module "@hyrious/esbuild-dev/args" {
    export { argsToBuildOptions, buildOptionsToArgs } from "@hyrious/esbuild-dev";
  }
  ```

## 0.4.3

- **feat**: Add `--bare` option to cli command `external`.\
  This option makes the output in the format of "one name per line".
- **refactor**: `--target=esnext` by default in `external()`.
- **refactor**: Use `{}` instead of `Set` in `external()`.\
  This minor change makes the result keep order on some platforms, which may be useful.

## 0.4.2

- **feat**: `external()` to search external libraries.
- **cli**: Sub command `external` to call `external()`.
- **feat**: `buildOptionsToArgs()` to reverse `argsToBuildOptions()`.

## 0.4.1

- **[BREAKING]**: There's no `--build` any more.
- Removed `chokidar` dependency, now it uses the builtin watch mode in esbuild.\
  This makes re-build/run slower, but will eat less CPU.

## 0.3.10

- **feat**: Support multiple build entries when use `--build`.\
  For example: `esbuild-dev --build src/index.ts src/bin.ts --outdir=lib`.
- **feat**: Support `--build` without entry file name.\
  In that case, it will infer your entries through package.json.

## 0.3.9

- **fix**: `importFile()` use correct path url.
- **fix**: Camelize keys when parsing args from command line.
- **fix**: Support `pkg.module`.
- **feat**: `requireFile()` to dynamically require a file, remember to add `--cjs` to use it.
- **feat**: `importFile()` to dynamically import a file.

## 0.3.5

- **fix**: Incorrect watch files on first run.
- **fix**: `lookupFile` typo error.
- **feat**: Support `--cjs` for `require.resolve` usage.
- **fix**: Remove `--enable-source-maps` in its bin file to prevent GitHub Action error.

## 0.3.1

- **[BREAKING]**: The outfile format is changed to `esm`.
  - `__filename` replacement is preserved for compatibility.
  - `require()` will throw error, use `import` instead.
- Deps are discovered through esbuild metafile instead of scanning `import` by hand.
- Export names are changed: `esbuildRun` &rarr; `runFile`, `esbuildDev` &rarr; `watchFile`.

## 0.2.8

- Bundle entry point to `node_modules/.esbuild-dev/file.js` and run it.
- Watch and rebuild incrementally and rerun.
- Shortcut to call `esbuild --bundle`.
- Plugins support.
