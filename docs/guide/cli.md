# Command Line

## Run File

```bash
$ esbuild-dev main.ts
# build and run main.ts in esm format

$ esbuild-dev --cjs main.ts
# build and run main.ts in cjs format

$ esbuild-dev --watch main.ts
# build and run main.ts, if the file changes, rebuild and run again
# shorthand: -w

$ esbuild-dev -p:./plugin.ts main.ts
# build and run main.ts, with plugin from file ./plugin.ts
# longhand: --plugin

$ esbuild-dev --import main.ts
# run main.ts with esm loader
# in this mode, --cjs, --watch and --plugin are not supported.
```

::: tip How `esbuild-dev` handle flags

To make it easy to understand and use, `esbuild-dev` related arguments should
be put **before** the entry file name. The full grammar is as follows:

```bash
$ esbuild-dev [ esbuild-dev flags | esbuild flags | args ] entry.ts [ args ]
```

:::

::: tip Include a third-party library if it does not work natively

In rare cases you can see error when you do `esbuild-dev --cjs main.ts` and
you're importing an ESM only package through `require()`. There're 2 ways to
handle it:

- Use ESM format to import it, i.e. `import()`.
- Use `--include:pkg` flag in esbuild-dev, e.g.

  ```bash
  $ esbuild-dev --include:has --include:function-bind test/include.ts
  ```

:::

### Plugin Details

The plugin argument in command line shares the same semantic as
[rollup][rollup-plugin]. The first character of the plugin name is used to
look up the plugin.

- `[@a-z0-9-~]`: the plugin is from a package.

  ```bash
  "-p:esbuild-plugin-style"
  ```

- `[./]`: the plugin is from a disk path.

  ```bash
  "-p:./plugin.ts"
  ```

- `{`: the plugin is from evaluating the string, this way, you can not
  write it as a function (which often starts with `function` or `() =>`).

  ```bash
  "-p:{ let a = 1; return a }"
  ```

You can pass exactly one argument to the plugin by appending `=arg` to the
plugin name.

```bash
"-p:pluginName={ answer: 42 }"
```

&uarr; It means to use the plugin by calling `pluginName({ answer: 42 })`.

## Show External

```bash
$ esbuild-dev external src/index.ts
# show external dependencies of src/index.ts

$ esbuild-dev external -b src/index.ts
# use "bare" format: one name per line
```

See the API [external](./api.md#external) for more details.

[rollup-plugin]: https://rollupjs.org/guide/en/#-p-plugin---plugin-plugin

## Debug

Anyway, when you get a syntax/runtime error, you can look at the
`node_modules/.esbuild-dev` folder to see bundled scripts.

```bash
$ esbuild-dev temp
# print full path to the '.esbuild-dev' folder from current place
```
