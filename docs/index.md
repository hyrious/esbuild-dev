# What it do?

A simple wrapper of esbuild to run your script file.

## Motivation

Writing TypeScript is fun, but executing them is not. `tsc` itself is just
a transpiler, it does not support bundling nor executing.

Now `ts-node` comes in, it wraps TypeScript compiler and makes use of
Node's [`require.extensions`][reqext] to run files, it works fine but does not
fully support pure ESM (they will). Besides, invoking type system is also
a waste of time when your files become more. Even if you turn-ed off type
checking, reading files in node's single thread is also slow.

Now, with [esbuild](https://esbuild.github.io), you can bundle your script
into one file and run it much faster.

```bash
$ esbuild-dev script.ts
# esbuild --bundle script.ts --outfile=node_modules/.esbuild-dev/script.ts.js
# node node_modules/.esbuild-dev/script.ts.js
```

That's it. Simple and naive.

Originally, I developed this tool to achieve <q>zero `*.js`</q> in some
projects.

## Alternatives

- [<samp>esno</samp> / <samp>esmo</samp>](https://github.com/antfu/esno) &mdash; [Anthony Fu](https://github.com/antfu)\
  It uses Node's native [`require.extensions`][reqext] for commonjs and [loaders](https://nodejs.org/api/esm.html#loaders) for es modules to achieve similar behavior.

[reqext]: https://nodejs.org/api/modules.html#requireextensions
