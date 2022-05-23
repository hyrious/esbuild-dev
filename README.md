## @hyrious/esbuild-dev

Build and run your `script.ts`, like `ts-node` or `node-dev`.

Require Node.js `>=16.13` to use `--enable-source-maps` and top-level await.

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

**CLI**:

```
Usage:
  esbuild-dev [--loader] [--cjs] [--watch] [--plugin:name] main.ts ...
  esbuild-dev external [--bare] main.ts ...

Options:
  --loader              Use `--experimental-loader` to run the file, which
                        is helpful when using other coverage tools.
                        In this mode, plugins are not supported.

  --no-warnings         Using experimental loader api will cause node
                        print warnings. Set this flag to turn off them all.
                        This is only a temporary workaround to please eyes.

  --cjs                 Change the outfile format to CJS. For example,
                        `__dirname` can only be used in CJS, and
                        `import.meta` can only be accessed in ESM.
                        This option cannot be used with `--loader`.

  --shims               Replace `import.meta.url` and `__dirname` with absolute
                        path in .[tj]s files.

  --watch               Enable watch mode. This is built on top of the
  alias: -w             built-in `watch` option of esbuild.

  --plugin:name         Load esbuild plugins. For example, `--plugin:style`
  alias: -p             will try to load `style` package in your project.
                        This option can not be used outside of a package.

  --[esbuild-options]   Additional flags left of the filename will be passed
                        to esbuild build options.

Sub Commands:
  external              Show potential external libraries of a file.
                        Additional arguments are passed to build options.
                        This command uses a custom resolve plugin to scan
                        and gather all package name imports and exclude them.

    --bare              Use bare format (one name per line, no quotes).
    alias: -b
```

**Library**

[Read the Docs to Learn More](https://hyrious.me/esbuild-dev).

### License

MIT @ [hyrious](https://github.com/hyrious)
