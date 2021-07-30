# Changelog

## Unreleased

- **feat**: Add `--bare` option to cli command `external`.\
  This option makes the output in the format of "one name per line".

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
- **feat**: `requireFile()` to dynamically require a file, remember to add `--cjs` to use it
- **feat**: `importFile()` to dynamically import a file

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
