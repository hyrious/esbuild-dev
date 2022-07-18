# API Reference

## Helper Methods

### `parse`

- **Type:** `(args: string[], configs: FlagConfig[]) => string[]`

```ts
const truthy = 0; // --sourcemap
const boolean = 1; // --bundle, --bundle=true
const string = 2; // --charset=utf8
const array = 3; // --main-fields=main,module
const list = 4; // --pure:console.log
const dict = 5; // --define:key=value

type FlagType = 0 | 1 | 2 | 3 | 4 | 5;

type FlagConfig = [
  dash_case: string,
  type: FlagType,
  opts?: { alias?: string[]; transform?: (value: any) => any }
];
```

Parse command line arguments in the esbuild way.

```ts
import { parse, EsbuildFlags } from "@hyrious/esbuild-dev/args";

parse(["--target=es6", "other args"], EsbuildFlags);
// => { target: "es6", _: ["other args"] }
```

## Requires `esbuild`

### `importFile`

- **Type:** `(path: string) => Promise<any>`

Imports a file like the built-in `import()`, except that it can also accept
several other file extensions including `.ts`.

```ts
import { importFile } from "@hyrious/esbuild-dev";

const config = await importFile("config.ts");
```

Very suitable for implementing config function like `vite.config.ts` for vite.

### `requireFile`

- **Type:** `(path: string) => Promise<any>`

Similar to `importFile()`, but internally it uses commonjs format.

### `external`

- **Type:** `(options?: ExternalPluginOptions) => esbuild.Plugin`

```ts
interface ExternalPluginOptions {
  /**
   * Passed to `onResolve()`, mark them as external.
   * @default /^[\w@][^:]/
   */
  filter?: RegExp;

  /**
   * Called on each external id.
   * @example
   * external({ onResolve(args) { externals.push(args.path) } })
   */
  onResolve?: (args: OnResolveArgs) => void;

  /**
   * Silently exclude some common file extensions.
   * @default true
   */
  exclude?: boolean | RegExp;
}
```

This is an esbuild plugin that externalizes all names look like [<q>package-name</q>][package-name-regex].

```ts
import { build } from "esbuild";
import { external } from "@hyrious/esbuild-dev";

build({
  entryPoints: ["index.ts"],
  bundle: true,
  plugins: [
    external({
      onResolve(id) {
        console.log("marked as external:", id);
      },
    }),
  ],
});
```

This function is suitable for implementing the pre-bundling optimization of vite.
Although they achieved this with [es-module-lexer].

[package-name-regex]: https://github.com/dword-design/package-name-regex
[es-module-lexer]: https://github.com/guybedford/es-module-lexer

### `resolve`

- **Type:** `(id: string, resolveDir: string) => Promise<string | undefined>`

Use esbuild to resolve a module id from the dir `resolveDir`.

```ts
import { resolve as esbuildResolve } from "@hyrious/esbuild-dev";

esbuildResolve("./a", "./src");
// => "./src/a.ts"
```

Because esbuild will parse tsconfig and correctly resolve the file from the
bundler side, this function is a cheap(?) way to achieve the well-known
[`resolve`][resolve] behavior of other bundlers.

[resolve]: https://github.com/browserify/resolve
