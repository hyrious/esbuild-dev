import { runFile, watchFile } from '.'
import { build } from './build'
import help from './help.txt'
import { resolvePlugins } from './utils'

function parseArgs(argv: string[]) {
  const flags = { help: false, watch: false, build: false, cjs: false }
  // 1. filenames does not start with '-', lets find them
  let fileIndex = argv.findIndex(e => !e.startsWith('-'))
  let entryPoints: string[] = []
  if (fileIndex !== -1) {
    let last = fileIndex
    while (last < argv.length && !argv[last].startsWith('-')) ++last
    entryPoints = argv.slice(fileIndex, last)
  } else {
    fileIndex = argv.length
  }
  // 2. args before filenames are flags passed to me
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
  // 3. args after filenames are flags passed to file or esbuild
  const args = argv.slice(fileIndex + entryPoints.length)
  return { ...flags, entryPoints, args }
}

async function main() {
  let argv = process.argv.slice(2)
  const plugins = resolvePlugins(argv)
  const flags = parseArgs(argv)

  if (flags.help) {
    console.log(help)
    process.exit()
  }

  if (flags.build) {
    await build({ ...flags, plugins })
    process.exit()
  }

  const fn = flags.watch ? watchFile : runFile
  await fn(flags.entryPoints[0], flags.args, {
    plugins,
    ...(flags.cjs && { format: 'cjs' }),
  })
}

main().catch()
