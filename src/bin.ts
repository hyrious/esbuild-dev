import help from './help.txt'
import { runFile, watchFile } from '.'
import { argv2config, resolveExternal, resolvePlugins } from './utils'
import { BuildOptions, buildSync } from 'esbuild'

function parseArgs(argv: string[]) {
  const flags = { help: false, watch: false, build: false, cjs: false }
  // 1. filename does not start with '-', lets find it
  const fileIndex = argv.findIndex(e => !e.startsWith('-'))
  if (fileIndex === -1) {
    return { ...flags, help: true, filename: '', args: [] }
  }
  const filename = argv[fileIndex]
  // 2. args before filename are flags passed to me
  for (let i = 0; i < fileIndex; ++i) {
    const flag = argv[i]
    /**/ if (['-h', '--help'].includes(flag)) flags.help = true
    else if (['-w', '--watch'].includes(flag)) flags.watch = true
    else if (['-b', '--build'].includes(flag)) flags.build = true
    else if ('--cjs' === flag) flags.cjs = true
    else {
      console.log(`unknown flag: ${flag}`)
    }
  }
  return { ...flags, filename, args: argv.slice(fileIndex + 1) }
}

async function main() {
  let argv = process.argv.slice(2)
  const plugins = resolvePlugins(argv)
  const flags = parseArgs(argv)

  if (flags.help) {
    return console.log(help)
  }

  if (flags.build) {
    let binOptions: BuildOptions | undefined
    if (flags.filename.includes('bin')) {
      binOptions = { banner: { js: '#!/usr/bin/env node' } }
    }
    const options: BuildOptions = {
      entryPoints: [flags.filename],
      external: resolveExternal(false),
      platform: 'node',
      target: 'node12',
      bundle: true,
      minify: true,
      sourcemap: true,
      outdir: 'dist',
      ...binOptions,
      ...argv2config(flags.args),
    }
    if (options.outdir && options.outfile) {
      // Cannot use both "outfile" and "outdir"
      delete options.outdir
    }
    return buildSync(options)
  }

  const fn = flags.watch ? watchFile : runFile
  const options: BuildOptions = {
    plugins,
    ...(flags.cjs && { format: 'cjs' }),
  }

  await fn(flags.filename, flags.args, options)
}

main().catch(console.error)
