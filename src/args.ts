export const truthy = 0;
export const boolean = 1;
export const string = 2;
export const array = 3;
export const list = 4;
export const dict = 5;

export type FlagType = 0 | 1 | 2 | 3 | 4 | 5;

export type FlagConfig = [
  dash_case: string,
  type: FlagType,
  opts?: { alias?: string[]; transform?: (value: any) => any },
];

function to_bool(str: string) {
  if (str === "true") return true;
  if (str === "false") return false;
  throw new Error("Invalid boolean value: " + str);
}

function to_array(str: string) {
  return str ? str.split(",") : [];
}

export const EsbuildFlags: readonly FlagConfig[] = [
  ["bundle", boolean],
  ["preserve-symlinks", boolean],
  ["splitting", boolean],
  ["allow-overwrite", boolean],
  ["watch", boolean],
  ["watch-delay", string, { transform: parseInt }],
  ["minify", boolean],
  ["minify-syntax", boolean],
  ["minify-whitespace", boolean],
  ["minify-identifiers", boolean],
  ["mangle-quoted", boolean],
  ["mangle-props", string, { transform: RegExp }],
  ["reserve-props", string, { transform: RegExp }],
  ["mangle-cache", string], // --mangle-cache=cache.json
  ["drop", list],
  ["drop-labels", array],
  ["legal-comments", string],
  ["charset", string],
  ["tree-shaking", boolean],
  ["ignore-annotations", boolean],
  ["keep-names", boolean],
  ["sourcemap", truthy],
  ["sourcemap", string],
  ["source-root", string],
  ["sources-content", boolean],
  ["sourcefile", string],
  ["resolve-extensions", array],
  ["main-fields", array],
  ["conditions", array],
  ["public-path", string],
  ["global-name", string],
  ["metafile", truthy],
  ["metafile", string],
  ["outfile", string],
  ["outdir", string],
  ["outbase", string],
  ["tsconfig", string],
  ["tsconfig-raw", string],
  ["entry-names", string],
  ["chunk-names", string],
  ["asset-names", string],
  ["define", dict],
  ["log-override", dict],
  ["abs-paths", array],
  ["supported", dict, { transform: to_bool }],
  ["pure", list],
  ["loader", dict],
  ["loader", string],
  ["target", array],
  ["out-extension", dict],
  ["platform", string],
  ["format", string],
  ["packages", string],
  ["external", list],
  ["inject", list],
  ["alias", dict],
  ["jsx", string],
  ["jsx-factory", string],
  ["jsx-fragment", string],
  ["jsx-import-source", string],
  ["jsx-dev", boolean],
  ["jsx-side-effects", boolean],
  ["banner", string],
  ["footer", string],
  ["banner", dict],
  ["footer", dict],
  ["log-limit", string, { transform: parseInt }],
  ["line-limit", string, { transform: parseInt }],
  ["color", boolean],
  ["log-level", string],
];

export const EsbuildDevFlags: readonly FlagConfig[] = [
  ["no-warnings", boolean],
  ["loader", boolean],
  ["import", boolean],
  ["cjs", boolean],
  ["shims", boolean],
  ["watch", boolean, { alias: ["w"] }],
  ["plugin", list, { alias: ["p"] }],
  ["include", list],
  ["exclude", list],
  ["node", list],
  ["cache", boolean],
  ["cwd", string],
];

export interface EsbuildDevOptions {
  noWarnings?: boolean;
  loader?: boolean;
  import?: boolean;
  cjs?: boolean;
  shims?: boolean;
  watch?: boolean;
  plugin?: string[];
  include?: string[];
  exclude?: string[];
  node?: string[];
  cache?: boolean;
  cwd?: string;
}

export const EsbuildDevExternalFlags: readonly FlagConfig[] = [
  ["bare", boolean, { alias: ["b"] }],
  ["include", list],
  ["exclude", list],
];

function camelize(key: string) {
  return key.replace(/-(\w)/g, (_, w: string) => w.toUpperCase());
}

function bare(arg: string, key: string, alias?: string[]) {
  return arg === "--" + key || !!(alias && alias.some(a => arg === "-" + a));
}

function equals(arg: string, key: string, alias?: string[]) {
  return arg.startsWith("--" + key + "=") || !!(alias && alias.some(a => arg.startsWith("-" + a + "=")));
}

function colon(arg: string, key: string, alias?: string[]) {
  return arg.startsWith("--" + key + ":") || !!(alias && alias.some(a => arg.startsWith("-" + a + ":")));
}

export type Parsed = { _: string[]; [key: string]: any };

/**
 * ```js
 * parseFlag(parsed = {}, "--bundle", ["bundle", truthy])
 * // => true, parsed = { bundle: true }
 * ```
 */
export function parseFlag(parsed: Parsed, arg: string, [flag, type, opts = {}]: FlagConfig): boolean {
  const key = camelize(flag);
  switch (type) {
    case truthy:
      if (bare(arg, flag, opts.alias)) {
        parsed[key] = opts.transform ? opts.transform(true) : true;
        return true;
      }
      return false;
    case boolean:
      if (bare(arg, flag, opts.alias)) {
        parsed[key] = true;
        return true;
      }
      if (equals(arg, flag, opts.alias)) {
        const value = arg.slice(arg.indexOf("=") + 1);
        if (value === "true") {
          parsed[key] = opts.transform ? opts.transform(true) : true;
          return true;
        }
        if (value === "false") {
          parsed[key] = opts.transform ? opts.transform(false) : false;
          return true;
        }
      }
      return false;
    case string:
      if (equals(arg, flag, opts.alias)) {
        const value = arg.slice(arg.indexOf("=") + 1);
        parsed[key] = opts.transform ? opts.transform(value) : value;
        return true;
      }
      return false;
    case array:
      if (equals(arg, flag, opts.alias)) {
        const value = to_array(arg.slice(arg.indexOf("=") + 1));
        parsed[key] = opts.transform ? opts.transform(value) : value;
        return true;
      }
      return false;
    case list:
      if (colon(arg, flag, opts.alias)) {
        const value = arg.slice(arg.indexOf(":") + 1);
        const list = ((parsed[key] as string[]) ||= []);
        list.push(opts.transform ? opts.transform(value) : value);
        return true;
      }
      return false;
    case dict:
      if (colon(arg, flag, opts.alias)) {
        const temp = arg.slice(arg.indexOf(":") + 1);
        const equals = temp.indexOf("=");
        if (equals !== -1) {
          const subKey = temp.slice(0, equals);
          const value = temp.slice(equals + 1);
          const dict = ((parsed[key] as Record<string, string>) ||= {});
          dict[subKey] = opts.transform ? opts.transform(value) : value;
          return true;
        }
      }
      return false;
    default:
      return false;
  }
}

export function parse(args: readonly string[], configs: readonly FlagConfig[]) {
  const parsed: Parsed = { _: [] };

  for (const arg of args) {
    if (!configs.some(config => parseFlag(parsed, arg, config))) {
      parsed._.push(arg);
    }
  }

  return parsed;
}
