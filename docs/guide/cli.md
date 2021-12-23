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

$ esbuild-dev --loader main.ts
# run main.ts with esm loader
# in this mode, --cjs, --watch and --plugin are not supported.
```

### Plugin Details

The plugin argument in command line shares the same semantic as
[rollup][rollup-plugin]. The first character of the plugin name is used to
look up the plugin.

- `[@a-z0-9-~]`: the plugin is from a package.
- `[./]`: the plugin is from a disk path.
- `{`: the plugin is from evaluating the string, this way, you can not
  write it as a function (which often starts with `function` or `() =>`).

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
