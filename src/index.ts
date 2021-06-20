import cp, { ChildProcess } from 'child_process'
import chokidar from 'chokidar'
import type { BuildIncremental, BuildOptions } from 'esbuild'
import debounce from 'lodash.debounce'
import url from 'url'
import { delay, errorMessage, esbuild, lookupFile } from './utils'

/**
 * Build and run the input file.
 * @example
 * runFile("main.ts")
 * // actually runs `node_modules/.esbuild-dev/main.ts.mjs`
 */
export async function runFile(
  filename: string,
  args: string[] = [],
  options?: BuildOptions
) {
  let outfile: string
  try {
    ;({ outfile } = await esbuild(filename, options))
  } catch {
    return
  }

  const argv = ['--enable-source-maps', outfile, ...args]
  try {
    cp.spawnSync(process.argv0, argv, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    })
  } catch {
    console.error(errorMessage(outfile, args))
  }
}

/**
 * Watch and run the input file.
 * @example
 * watchFile("main.ts")
 * // actually runs `node_modules/.esbuild-dev/main.ts.mjs`
 */
export async function watchFile(
  filename: string,
  args: string[] = [],
  options?: BuildOptions
) {
  let outfile: string
  let result: BuildIncremental | undefined
  let argv: string[]
  let child: ChildProcess | undefined

  const rebuild = async (pkgJsonChanged = false) => {
    if (result && pkgJsonChanged) {
      result.rebuild.dispose()
      result = undefined
    }

    try {
      if (result) {
        result = await result.rebuild()
      } else {
        ;({ outfile, result } = await esbuild(filename, {
          ...options,
          incremental: true,
        }))
        argv = ['--enable-source-maps', outfile, ...args]
      }
      return true
    } catch {
      result = undefined
      // esbuild already prints error message, don't show again
      return false
    }
  }

  const stop = async () => {
    if (child) {
      const dying = child
      child = undefined
      dying.kill('SIGTERM')
      await delay(100)
      if (dying.killed) return
      await delay(900)
      if (!dying.killed) dying.kill('SIGKILL')
      await delay(100)
    }
  }

  const restart = async () => {
    await stop()
    if (result) {
      try {
        child = cp.spawn(process.argv0, argv, {
          stdio: 'inherit',
          cwd: process.cwd(),
          env: process.env,
        })
        child.on('close', code => {
          console.log('[esbuild-dev] child process stopped with code', code)
          child = undefined
        })
        child.on('error', () => {
          console.error(errorMessage(outfile, args))
          stop()
        })
      } catch {
        console.error(errorMessage(outfile, args))
        child = undefined
      }
    }
  }

  const pkgJson = lookupFile(filename, 'package.json')
  if (pkgJson) {
    chokidar.watch(pkgJson).on('change', async () => {
      if (await rebuild(true)) await restart()
    })
  }

  const watcher = chokidar.watch(filename)
  watcher.on('ready', updateDepsAndRestart)
  watcher.on('change', debounce(updateDepsAndRestart, 300))

  async function updateDepsAndRestart() {
    if (await rebuild()) await restart()
    watcher.unwatch(Object.keys(watcher.getWatched()))
    watcher.add([filename, ...Object.keys({ ...result?.metafile?.inputs })])
  }
}

/**
 * @example
 * requireFile('main.ts')
 * // actually runs `require("node_modules/.esbuild-dev/main.ts.js")`
 * // returns undefined if esbuild failed
 * // note that require() is forbidden in esm modules
 * // remember to add "--cjs" when use esbuild-dev to run this file
 */
export async function requireFile(filename: string, options?: BuildOptions) {
  let outfile: string
  try {
    ;({ outfile } = await esbuild(filename, { ...options, format: 'cjs' }))
  } catch {
    return
  }
  return require(outfile)
}

/**
 * @example
 * await importFile('main.ts')
 * // actually runs `import("node_modules/.esbuild-dev/main.ts.mjs")`
 * // returns undefined if esbuild failed
 */
export async function importFile(filename: string, options?: BuildOptions) {
  let outfile: string
  try {
    ;({ outfile } = await esbuild(filename, { ...options, format: 'esm' }))
  } catch {
    return
  }
  return import(url.pathToFileURL(outfile).toString())
}
