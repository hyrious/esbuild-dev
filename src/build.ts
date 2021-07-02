import { build as esbuild, BuildOptions, Plugin } from 'esbuild'
import fs from 'fs'
import path from 'path'
import { argv2config, lookupFile, resolveExternal } from './utils'

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
  logLevel: 'info',
}

export async function build({ plugins, entryPoints, args }: Options) {
  const options: BuildOptions = {
    ...defaultOptions,
    entryPoints,
    external: resolveExternal(false),
    plugins,
    ...argv2config(args),
  }

  if (entryPoints.length === 0) {
    return await rollpkg(options)
  }

  fixConflicts(options)

  // Can only support add this banner in one entry point
  if (entryPoints.length === 1 && entryPoints[0].includes('bin')) {
    setBinBanner(options)
  }

  return await esbuild(options)
}

function setBinBanner(options: BuildOptions) {
  options.banner = { js: '#!/usr/bin/env node' }
}

function fixConflicts(options: BuildOptions) {
  if (options.outfile && options.outdir) {
    // Cannot use both "outfile" and "outdir"
    delete options.outdir
  }
}

function rollpkg(options: BuildOptions) {
  const pkgPath = lookupFile(process.cwd(), 'package.json')
  if (!pkgPath) {
    console.error('can not use --build <no entry> outside of npm package')
    process.exit(1)
  }

  const pkgDir = path.dirname(pkgPath)
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  const first = (...names: string[]) => {
    const exts = 'tsx|ts|jsx|mjs|js'.split('|')
    for (const name of names) {
      for (const ext of exts) {
        const file = path.join(pkgDir, `${name}.${ext}`)
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
          return path.relative(process.cwd(), file)
        }
      }
    }
  }
  const format = (key: string) =>
    pkg.type === 'module' ||
    key.endsWith('.mjs') ||
    key.endsWith('.es.js') ||
    key.endsWith('.esm.js')
      ? 'esm'
      : 'cjs'

  const inOut: { in: string; out: string; format: 'esm' | 'cjs' }[] = []

  let file: string | undefined
  if (pkg.main && (file = first('src/index', 'index'))) {
    inOut.push({ in: file, out: pkg.main, format: format(pkg.main) })
  }
  if (pkg.module && file) {
    inOut.push({ in: file, out: pkg.module, format: format(pkg.module) })
  }
  if (pkg.bin && (file = first('src/bin', 'bin'))) {
    let out = pkg.bin
    if (Array.isArray(out)) {
      out = out[0]
    } else if (typeof out === 'object' && out !== null) {
      out = Object.values(out)[0]
    }
    if (typeof out === 'string') {
      inOut.push({ in: file, out, format: format(out) })
    }
  }

  return Promise.all(
    inOut.map(e => {
      const buildOptions = {
        ...options,
        entryPoints: [e.in],
        outfile: e.out,
        format: e.format,
      }
      fixConflicts(buildOptions)
      if (e.in.includes('bin')) {
        setBinBanner(buildOptions)
      }
      return esbuild(buildOptions)
    })
  )
}
