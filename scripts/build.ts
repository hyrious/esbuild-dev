import { build, BuildOptions } from 'esbuild'
import pkg from '../package.json'

const common: BuildOptions = {
  external: Object.keys(pkg.dependencies),
  platform: 'node',
  bundle: true,
  sourcemap: true,
  outdir: 'dist',
  target: 'node14',
  logLevel: 'info',
}

build({
  ...common,
  entryPoints: ['src/bin.ts'],
  banner: { js: '#!/usr/bin/env node' },
})

build({
  ...common,
  entryPoints: ['src/index.ts'],
})

build({
  ...common,
  outdir: undefined,
  outfile: pkg.module,
  format: 'esm',
  entryPoints: ['src/index.ts'],
})
