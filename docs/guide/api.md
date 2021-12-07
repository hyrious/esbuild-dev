# API Reference

## Helper Methods

### `buildOptionsToArgs`

- **Type:** `(options: BuildOptions | TransformOptions) => string[]`

Transform build options object to command line arguments.

```ts
buildOptionsToArgs({ target: "es6" }); // => ["--target=es6"]
```

- It does not check whether the options are valid.
- The output array does not including `"`s around the arguments.\
  i.e. It will output `--banner:js=a b c` instead of `--banner:js="a b c"`.

### `argsToBuildOptions`

- **Type:** `(args: string[]) => BuildOptions & TransformOptions`

The reverse of `buildOptionsToArgs`.

```ts
argsToBuildOptions(["--target=es6"]); // => { target: "es6" }
```

Same caveats as `buildOptionsToArgs`. You should pass in `--banner:js=a b c`
instead of `--banner:js="a b c"`.

## Requires `esbuild`

### `importFile`

- **Type:** `(path: string) => Promise<any>`

Imports a file like the built-in `import()`, except that it can also accept
several other file extensions including `.ts`.

```ts
const config = await importFile("config.ts");
```

Very suitable for implementing config function like `vite.config.ts` for vite.

### `requireFile`

- **Type:** `(path: string) => Promise<any>`

Similar to `importFile()`, but internally it uses commonjs format.

### `external`

- **Type:** `(path: string) => Promise<string[]>`

Scan an entry file to guess potential external libraries of your project.

```ts
const externals = await external("src/index.ts");
// => ["esbuild", "path", "fs"]
```

It works by bundling your source once with a custom plugin that externalizes
all [<q>package-name-like</q>][package-name-regex] imports. This function is
suitable for implementing the pre-bundling optimization of vite. Although
they achieve this with [es-module-lexer].

[package-name-regex]: https://github.com/dword-design/package-name-regex
[es-module-lexer]: https://github.com/guybedford/es-module-lexer
