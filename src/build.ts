import { build as esbuild, BuildOptions, Plugin } from 'esbuild'
import { argv2config, resolveExternal } from './utils'

interface Options {
  plugins: Plugin[]
  entryPoints: string[]
  args: string[]
}

const defaultOptions: BuildOptions = {
  platform: 'node',
  target: 'node12',
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'dist',
}

export async function build({ plugins, entryPoints, args }: Options) {
  const options: BuildOptions = {
    ...defaultOptions,
    entryPoints,
    external: resolveExternal(false),
    plugins,
    ...argv2config(args),
  }

  if (options.outfile && options.outdir) {
    // Cannot use both "outfile" and "outdir"
    delete options.outdir
  }

  // TODO: only support add this banner in one entry point
  if (entryPoints.length === 1 && entryPoints[0].includes('bin')) {
    options.banner = { js: '#!/usr/bin/env node' }
  }

  return await esbuild(options)
}
