export enum EnumFlagType {
  Truthy, // --bundle
  Boolean, // --tree-shaking=true
  String, // --charset=utf8
  Array, // --main-fields=main,module
  List, // --pure:console.log
  Pair, // --define:key=value
  Number, // --log-limit=100
}

export type FlagType = EnumFlagType | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type FlagConfig = [dash_case: string, type: FlagType, alias?: string[]];

export const EsbuildFlags: readonly FlagConfig[] = [
  ["bundle", EnumFlagType.Truthy],
  ["preserve-symlinks", EnumFlagType.Truthy],
  ["splitting", EnumFlagType.Truthy],
  ["allow-overwrite", EnumFlagType.Truthy],
  ["watch", EnumFlagType.Truthy],
  ["minify", EnumFlagType.Truthy],
  ["minify-syntax", EnumFlagType.Truthy],
  ["minify-whitespace", EnumFlagType.Truthy],
  ["minify-identifiers", EnumFlagType.Truthy],
  ["legal-comments", EnumFlagType.String],
  ["charset", EnumFlagType.String],
  ["tree-shaking", EnumFlagType.Boolean],
  ["ignore-annotations", EnumFlagType.Truthy],
  ["keep-names", EnumFlagType.Truthy],
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
  ["target", EnumFlagType.String],
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
  ["bundle", EnumFlagType.Truthy, ["b"]],
  ["bundle", EnumFlagType.String, ["b"]],
  ["cjs", EnumFlagType.Truthy],
  ["watch", EnumFlagType.Truthy, ["w"]],
  ["plugin", EnumFlagType.List, ["p"]],
];

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

/**
 * @example
 * parseFlag(parsed = {}, "--bundle", ["bundle", EnumFlagType.Truthy])
 * => true, parsed = { bundle: true }
 */
export function parseFlag(
  parsed: Record<string, unknown>,
  arg: string,
  [flag, type, alias]: FlagConfig
): boolean {
  const key = camelize(flag);
  switch (type) {
    case EnumFlagType.Truthy:
      if (single(arg, flag, alias)) {
        parsed[key] = true;
        return true;
      }
      return false;
    case EnumFlagType.Boolean:
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
        const value = arg.slice(arg.indexOf("=") + 1);
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
    default:
      return false;
  }
}
