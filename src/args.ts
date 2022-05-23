export enum EnumFlagType {
  Truthy, // --sourcemap
  Boolean, // --bundle, --tree-shaking=true
  String, // --charset=utf8
  Array, // --main-fields=main,module
  List, // --pure:console.log
  Pair, // --define:key=value
  Number, // --log-limit=100
  RegExp, // --mangle-props=_$
}

export type FlagType = EnumFlagType | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type FlagConfig = [dash_case: string, type: FlagType, alias?: string[]];

export const EsbuildFlags: readonly FlagConfig[] = [
  ["bundle", EnumFlagType.Boolean],
  ["preserve-symlinks", EnumFlagType.Boolean],
  ["splitting", EnumFlagType.Boolean],
  ["allow-overwrite", EnumFlagType.Boolean],
  ["watch", EnumFlagType.Boolean],
  ["minify", EnumFlagType.Boolean],
  ["minify-syntax", EnumFlagType.Boolean],
  ["minify-whitespace", EnumFlagType.Boolean],
  ["minify-identifiers", EnumFlagType.Boolean],
  ["mangle-quoted", EnumFlagType.Boolean],
  ["mangle-props", EnumFlagType.RegExp],
  ["reserve-props", EnumFlagType.RegExp],
  ["mangle-cache", EnumFlagType.String],
  ["drop", EnumFlagType.List],
  ["legal-comments", EnumFlagType.String],
  ["charset", EnumFlagType.String],
  ["tree-shaking", EnumFlagType.Boolean],
  ["ignore-annotations", EnumFlagType.Boolean],
  ["keep-names", EnumFlagType.Boolean],
  ["sourcemap", EnumFlagType.Truthy],
  ["sourcemap", EnumFlagType.String],
  ["source-root", EnumFlagType.String],
  ["sources-content", EnumFlagType.Boolean],
  ["sourcefile", EnumFlagType.String],
  ["resolve-extensions", EnumFlagType.Array],
  ["main-fields", EnumFlagType.Array],
  ["conditions", EnumFlagType.Array],
  ["public-path", EnumFlagType.String],
  ["global-name", EnumFlagType.String],
  ["metafile", EnumFlagType.Truthy],
  ["metafile", EnumFlagType.String],
  ["outfile", EnumFlagType.String],
  ["outdir", EnumFlagType.String],
  ["outbase", EnumFlagType.String],
  ["tsconfig", EnumFlagType.String],
  ["tsconfig-raw", EnumFlagType.String],
  ["entry-names", EnumFlagType.String],
  ["chunk-names", EnumFlagType.String],
  ["asset-names", EnumFlagType.String],
  ["define", EnumFlagType.Pair],
  ["pure", EnumFlagType.List],
  ["loader", EnumFlagType.Pair],
  ["loader", EnumFlagType.String],
  ["target", EnumFlagType.Array],
  ["out-extension", EnumFlagType.Pair],
  ["platform", EnumFlagType.String],
  ["format", EnumFlagType.String],
  ["external", EnumFlagType.List],
  ["inject", EnumFlagType.List],
  ["jsx", EnumFlagType.String],
  ["jsx-factory", EnumFlagType.String],
  ["jsx-fragment", EnumFlagType.String],
  ["banner", EnumFlagType.String],
  ["footer", EnumFlagType.String],
  ["banner", EnumFlagType.Pair],
  ["footer", EnumFlagType.Pair],
  ["log-limit", EnumFlagType.Number],
  ["color", EnumFlagType.Boolean],
  ["log-level", EnumFlagType.String],
];

export const EsbuildDevFlags: readonly FlagConfig[] = [
  ["no-warnings", EnumFlagType.Truthy],
  ["loader", EnumFlagType.Truthy],
  ["cjs", EnumFlagType.Truthy],
  ["shims", EnumFlagType.Truthy],
  ["watch", EnumFlagType.Truthy, ["w"]],
  ["plugin", EnumFlagType.List, ["p"]],
];

export interface EsbuildDevOptions {
  noWarnings?: boolean;
  loader?: boolean;
  cjs?: boolean;
  shims?: boolean;
  watch?: boolean;
  plugin?: string[];
}

export const EsbuildDevExternalFlags: readonly FlagConfig[] = [
  ["bare", EnumFlagType.Truthy, ["b"]],
];

function camelize(key: string) {
  return key.replace(/-(\w)/g, (_, w: string) => w.toUpperCase());
}

function single(arg: string, key: string, alias?: string[]) {
  return arg === "--" + key || !!(alias && alias.some(a => arg === "-" + a));
}

function equal(arg: string, key: string, alias?: string[]) {
  return (
    arg.startsWith("--" + key + "=") ||
    !!(alias && alias.some(a => arg.startsWith("-" + a + "=")))
  );
}

function colon(arg: string, key: string, alias?: string[]) {
  return (
    arg.startsWith("--" + key + ":") ||
    !!(alias && alias.some(a => arg.startsWith("-" + a + ":")))
  );
}

export type Parsed = { _: string[]; [key: string]: any };

/**
 * @example
 * parseFlag(parsed = {}, "--bundle", ["bundle", EnumFlagType.Truthy])
 * => true, parsed = { bundle: true }
 */
export function parseFlag(
  parsed: Parsed,
  arg: string,
  [flag, type, alias]: FlagConfig
): boolean {
  const key = camelize(flag);
  switch (type) {
    case EnumFlagType.Truthy: // can only use --sourcemap
      if (single(arg, flag, alias)) {
        parsed[key] = true;
        return true;
      }
      return false;
    case EnumFlagType.Boolean: // can use both --bundle and --bundle=true
      if (single(arg, flag, alias)) {
        parsed[key] = true;
        return true;
      }
      if (equal(arg, flag, alias)) {
        const value = arg.slice(arg.indexOf("=") + 1);
        if (value === "true") {
          parsed[key] = true;
          return true;
        }
        if (value === "false") {
          parsed[key] = false;
          return true;
        }
      }
      return false;
    case EnumFlagType.String:
      if (equal(arg, flag, alias)) {
        parsed[key] = arg.slice(arg.indexOf("=") + 1);
        return true;
      }
      return false;
    case EnumFlagType.Array:
      if (equal(arg, flag, alias)) {
        const value = arg.slice(arg.indexOf("=") + 1);
        parsed[key] = value ? value.split(",") : [];
        return true;
      }
      return false;
    case EnumFlagType.List:
      if (colon(arg, flag, alias)) {
        const value = arg.slice(arg.indexOf(":") + 1);
        ((parsed[key] as string[]) ||= []).push(value);
        return true;
      }
      return false;
    case EnumFlagType.Pair:
      if (colon(arg, flag, alias)) {
        const value = arg.slice(arg.indexOf(":") + 1);
        const equalSign = value.indexOf("=");
        if (equalSign !== -1) {
          ((parsed[key] as Record<string, string>) ||= {})[
            value.slice(0, equalSign)
          ] = value.slice(equalSign + 1);
          return true;
        }
      }
      return false;
    case EnumFlagType.Number:
      if (equal(arg, flag, alias)) {
        parsed[key] = parseInt(arg.slice(arg.indexOf("=") + 1));
        return true;
      }
      return false;
    case EnumFlagType.RegExp:
      if (equal(arg, flag, alias)) {
        parsed[key] = new RegExp(arg.slice(arg.indexOf("=") + 1));
        return true;
      }
      return false;
    default:
      return false;
  }
}

export function parse(args: readonly string[], configs: readonly FlagConfig[]) {
  const parsed: Parsed = { _: [] };

  for (const arg of args)
    if (!configs.some(config => parseFlag(parsed, arg, config)))
      parsed._.push(arg);

  return parsed;
}
