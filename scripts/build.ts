import { build, BuildOptions } from 'esbuild'
import pkg from '../package.json'

const common: BuildOptions = {
  external: Object.keys(pkg.dependencies),
  platform: 'node',
  bundle: true,
  sourcemap: true,
  outdir: 'dist',
  target: 'node12',
}

build({
  ...common,
  entryPoints: ['src/bin.ts'],
  minify: true,
  banner: { js: '#!/usr/bin/env node --enable-source-maps' },
})

build({
  ...common,
  entryPoints: ['src/index.ts'],
})
