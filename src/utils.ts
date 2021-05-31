import type {
  BuildIncremental,
  BuildOptions,
  BuildResult,
  Plugin,
} from 'esbuild'
import { build } from 'esbuild'
import fs from 'fs'
import os from 'os'
import path from 'path'
import util from 'util'
import message from './message.txt'

export function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function lookupFile(dir: string, file: string): string | undefined {
  const fullPath = path.join(dir, file)
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return fullPath
  }
  const parentDir = path.dirname(dir)
  if (parentDir !== dir) {
    return lookupFile(dir, file)
  }
}

export function resolveOutdir() {
  const pkgPath = lookupFile(process.cwd(), 'package.json')
  if (pkgPath) {
    const outdir = path.join(path.dirname(pkgPath), `node_modules/.esbuild-dev`)
    fs.mkdirSync(outdir, { recursive: true })
    return outdir
  }
  return os.tmpdir()
}

export function resolveExternal(includeDev = true) {
  const pkgPath = lookupFile(process.cwd(), 'package.json')
  if (pkgPath) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    return Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...(includeDev && pkg.devDependencies),
    })
  }
  return []
}

function unwrap(mod: any) {
  if (typeof mod === 'object' && mod.__esModule) {
    return mod.default || mod
  } else {
    return mod
  }
}

export function resolvePlugins(argv: string[]) {
  const pkgPath = lookupFile(process.cwd(), 'package.json')
  if (!pkgPath) {
    throw new Error('can not use plugins outside of npm package')
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const deps = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  }).filter(e => e.includes('esbuild-'))
  const flags = new Set(['-p', '--plugin'])
  const plugins: Plugin[] = []
  let seeFlag = false
  for (const arg of argv) {
    if (seeFlag) {
      seeFlag = false
      let mod: Plugin | (() => Plugin) | undefined
      if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
        mod = unwrap(require(path.resolve(arg)))
      } else {
        for (const dep of deps) {
          if (dep.includes(arg)) {
            mod = unwrap(require(dep))
            break
          }
        }
      }
      if (mod) {
        if (mod instanceof Function) {
          try {
            plugins.push(mod())
          } catch {}
        } else {
          plugins.push(mod)
        }
      }
    } else if (flags.has(arg)) {
      seeFlag = true
    }
  }
  for (let i = -1; (i = argv.findIndex(e => flags.has(e))) !== -1; ) {
    argv.splice(i, 2)
  }
  return plugins
}

export async function esbuild(
  entryPoint: string,
  options?: BuildOptions & { incremental: true }
): Promise<{ outfile: string; result: BuildIncremental }>
export async function esbuild(
  entryPoint: string,
  options?: BuildOptions
): Promise<{ outfile: string; result: BuildResult }>
export async function esbuild(entryPoint: string, options: BuildOptions = {}) {
  const outdir = resolveOutdir()
  const outfile = path.resolve(outdir, entryPoint + '.mjs')
  const result = await build({
    entryPoints: [entryPoint],
    external: resolveExternal(),
    platform: 'node',
    target: 'node14',
    format: 'esm',
    bundle: true,
    sourcemap: true,
    metafile: true,
    outfile,
    define: {
      __filename: JSON.stringify(outfile),
      __dirname: JSON.stringify(path.dirname(outfile)),
    },
    ...options,
  })
  return { outfile, result }
}

export function errorMessage(file: string, args_: string[]) {
  const args = args_.map(e => util.inspect(e)).join(' ')
  const template = { file, args }
  return message.replaceAll(
    /{(\w+)}/g,
    (_, key: 'file' | 'args') => template[key] || ''
  )
}

function str2config(str: string) {
  str = str.trim()
  if (!str.startsWith('--')) {
    console.warn(
      "warning: build options must start with '--', got invalid option:"
    )
    console.warn(util.inspect(str))
    return {}
  }
  if (str.startsWith('--no-')) {
    return { [str.substring(/* "--no-".length */ 5)]: false }
  }
  str = str.substring(/* "--".length */ 2)
  const keyMatch = str.match(/^[-\w]+/)
  if (keyMatch == null) {
    console.warn('warning: expecting valid build option key, got:')
    console.warn(util.inspect(str))
    return {}
  }
  const key = keyMatch[0]
  str = str.substring(key.length).trim()
  if (!str) {
    return { [key]: true }
  }
  const delimiter = str[0]
  str = str.substring(1)
  if (delimiter === '=') {
    if (!str) {
      return { [key]: str }
    }
    const mayBeNumber = Number(str)
    if (Number.isNaN(mayBeNumber)) {
      return { [key]: str }
    } else {
      return { [key]: mayBeNumber }
    }
  } else if (delimiter === ':') {
    const [k, v] = str.split('=', 2)
    if (v === undefined) {
      return { [key]: [k] }
    } else {
      return { [key]: { [k]: v } }
    }
  } else {
    console.warn('warning: expecting valid build option value, got:')
    console.warn(util.inspect(str))
    return {}
  }
}

export function argv2config(argv: string[]) {
  const config: Record<string, unknown> = {}
  for (const arg of argv.map(str2config)) {
    for (const key in arg) {
      const value = arg[key]
      if (Array.isArray(value)) {
        config[key] = [...((config[key] as string[]) ?? []), ...value]
      } else if (typeof value === 'object') {
        config[key] = { ...(config[key] as object), ...value }
      } else {
        config[key] = value
      }
    }
  }
  return config as BuildOptions
}
