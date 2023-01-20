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

### [<samp>tsx</samp>](https://github.com/esbuild-kit/tsx)

It uses Node's native [`require.extensions`][reqext] for commonjs and [loaders](https://nodejs.org/api/esm.html#loaders) for es modules to achieve similar behavior. There are pros and cons in compare it with mine:

First of all, we're using different functions in esbuild to transform your ts files to js. `tsx` uses `transform`, while I use `build` with bundle enabled.

<table><thead><tr><th></th><th><code>tsx</code> (transform)</th><th><code>@hyrious/esbuild-dev</code> (build)</th></tr></thead><tbody><tr><td>Pros</td><td>

- Transforming is lighter than bundling, it may be faster
- Can totally run in memory, cache files are just for further speed up

</td><td>

- Can use every esbuild build-only features, for example plugins
- Easy to debug because you can find the bundled js file in your disk

</td></tr><tr><td>Cons</td><td>

- Hard to debug because cache files are minified and named in hash
- Cannot use plugins, but you can chain other node loaders to do similar

</td><td>

- Cannot totally run in memory, it has to write the result to your disk
- Bundling can be slower when you have lots of files or slow plugins

</td></tr></tbody></table>

Note that I also have a loader mode which is a simpler implementation in that it doesn't hack `require.extensions` and in most of the cases it is enough to do e.g. unit test with coverage report.

[reqext]: https://nodejs.org/api/modules.html#requireextensions
