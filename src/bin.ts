import help from './help.txt'
import { runFile, watchFile } from '.'
import { argv2config, resolveExternal, resolvePlugins } from './utils'
import { BuildOptions, buildSync } from 'esbuild'

async function main() {
  let argv = process.argv.slice(2)
  const plugins = resolvePlugins(argv)
  const shouldHelp = argv.includes('--help')
  const shouldWatch = argv.indexOf('--watch')
  const shouldBuild = argv.indexOf('--build')

  if (shouldWatch !== -1) {
    argv.splice(shouldWatch, 1)
  }

  if (shouldHelp || !argv[0]) {
    return console.log(help)
  }

  if (shouldBuild !== -1) {
    argv.splice(shouldBuild, -1)
    let binOptions: BuildOptions | undefined
    if (argv[0].includes('bin')) {
      binOptions = { banner: { js: '#!/usr/bin/env node' } }
    }
    const options: BuildOptions = {
      entryPoints: [argv[0]],
      external: resolveExternal(false),
      platform: 'node',
      target: 'node12',
      bundle: true,
      minify: true,
      sourcemap: true,
      outdir: 'dist',
      ...binOptions,
      ...argv2config(argv.slice(1)),
    }
    if (options.outdir && options.outfile) {
      // Cannot use both "outfile" and "outdir"
      delete options.outdir
    }
    buildSync(options)
    return
  }

  const [filename, ...args] = argv
  if (shouldWatch !== -1) {
    await watchFile(filename, args, { plugins })
  } else {
    await runFile(filename, args, { plugins })
  }
}

main().catch(console.error)
