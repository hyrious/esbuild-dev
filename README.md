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
npm i -g esbuild esbuild-dev
```

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

  --watch               Enable watch mode. This is built on top of the
  alias: -w             built-in `watch` option of esbuild.

  --plugin:name         Load esbuild plugins. For example, `--plugin:style`
  alias: -p             will try to load `style` package in your project.
                        This option can not be used outside of a package.

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
