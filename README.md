## @hyrious/esbuild-dev

Build and run your `script.ts`, like `ts-node` or `node-dev`.

Require Node.js `>=16.13` to use `--enable-source-maps` and top-level await.

### Install

```bash
npm i -g @hyrious/esbuild-dev esbuild
```

> **Note:** esbuild is a peer dependency!

### Usage

**CLI**:

```js
Usage:
  esbuild-dev [--bundle] [--cjs] [--watch] [--plugin:name] main.ts ...
  esbuild-dev external [--bare] main.ts ...

Options:
  --bundle[=outfile.js] Bundle the script file to some place then execute it.
  alias: -b             This is the same behavior as esbuild-dev < 0.7.
                        The default outdir is node_modules/.esbuild-dev.

  --cjs                 Change the outfile format to CJS. For example,
                        `__dirname` can only be used in CJS, and
                        `import.meta` can only be accessed in ESM.
                        This option will turn on --bundle automatically.

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
