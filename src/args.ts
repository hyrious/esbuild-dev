import { BuildOptions, TransformOptions } from "esbuild";

/**
 * @example
 * let args = ["--bundle", "--flag"]
 * parseAndRemoveArgs(args) // { bundle: true }
 * args // ["--flag"]
 */
export function parseAndRemoveArgs(
  args: string[]
): BuildOptions & TransformOptions {
  let { length: n } = args;
  const options: BuildOptions & TransformOptions = {};

  type Options = BuildOptions & TransformOptions;
  type KeysMatching<T, V> = {
    [K in keyof T]-?: NonNullable<V> extends T[K] ? K : never;
  }[keyof T];
  type Flag = `--${string}`;
  type Prefix = `${Flag}=`;
  type Prefix2 = `${Flag}:`;

  type Booleans = KeysMatching<Options, boolean>;
  function truthy(arg: string, flag: Flag, key: Booleans) {
    if (arg === flag) {
      options[key] = true;
      return true;
    }
    return false;
  }

  type Strings = KeysMatching<Options, string>;
  function string(arg: string, prefix: Prefix, key: Strings) {
    if (arg.startsWith(prefix)) {
      options[key] = arg.slice(prefix.length);
      return true;
    }
    return false;
  }

  function boolean(arg: string, prefix: Prefix, key: Booleans) {
    if (arg.startsWith(prefix)) {
      const value = arg.slice(prefix.length);
      if (value === "true") {
        options[key] = true;
        return true;
      } else if (value === "false") {
        options[key] = false;
        return true;
      }
    }
    return false;
  }

  type Arrays = KeysMatching<Options, Array<string>>;
  function array(arg: string, prefix: Prefix, key: Arrays) {
    if (arg.startsWith(prefix)) {
      const value = arg.slice(prefix.length);
      options[key] = value ? value.split(",") : [];
      return true;
    }
    return false;
  }

  type Pair = KeysMatching<Options, Record<string, string>>;
  function pair(arg: string, prefix: Prefix2, key: Pair) {
    if (arg.startsWith(prefix)) {
      const value = arg.slice(prefix.length);
      const equals = value.indexOf("=");
      if (equals !== -1) {
        (options[key] ||= {})[value.slice(0, equals)] = value.slice(equals + 1);
        return true;
      }
    }
    return false;
  }

  function append(arg: string, prefix: Prefix2, key: Arrays) {
    if (arg.startsWith(prefix)) {
      const value = arg.slice(prefix.length);
      (options[key] ||= []).push(value);
      return true;
    }
    return false;
  }

  type Numbers = KeysMatching<Options, number>;
  function number(arg: string, prefix: Prefix, key: Numbers) {
    if (arg.startsWith(prefix)) {
      options[key] = parseInt(arg.slice(prefix.length), 10);
      return true;
    }
    return false;
  }

  while (n--) {
    const arg = args.shift()!;
    false ||
      truthy(arg, "--bundle", "bundle") ||
      truthy(arg, "--preserve-symlinks", "preserveSymlinks") ||
      truthy(arg, "--splitting", "splitting") ||
      truthy(arg, "--allow-overwrite", "allowOverwrite") ||
      truthy(arg, "--watch", "watch") ||
      truthy(arg, "--minify", "minify") ||
      truthy(arg, "--minify-syntax", "minifySyntax") ||
      truthy(arg, "--minify-whitespace", "minifyWhitespace") ||
      truthy(arg, "--minify-identifiers", "minifyIdentifiers") ||
      string(arg, "--legal-comments=", "legalComments" as Strings) ||
      string(arg, "--charset=", "charset" as Strings) ||
      boolean(arg, "--tree-shaking=", "treeShaking") ||
      truthy(arg, "--ignore-annotations", "ignoreAnnotations") ||
      truthy(arg, "--keep-names", "keepNames") ||
      truthy(arg, "--sourcemap", "sourcemap") ||
      string(arg, "--sourcemap=", "sourcemap" as Strings) ||
      string(arg, "--source-root=", "sourceRoot") ||
      boolean(arg, "--sources-content=", "sourcesContent") ||
      string(arg, "--sourcefile=", "sourcefile") ||
      array(arg, "--resolve-extensions=", "resolveExtensions") ||
      array(arg, "--main-fields=", "mainFields") ||
      array(arg, "--conditions=", "conditions") ||
      string(arg, "--public-path=", "publicPath") ||
      string(arg, "--global-name=", "globalName") ||
      truthy(arg, "--metafile", "metafile") ||
      string(arg, "--metafile=", "metafile" as Strings) ||
      string(arg, "--outfile=", "outfile") ||
      string(arg, "--outdir=", "outdir") ||
      string(arg, "--outbase=", "outbase") ||
      string(arg, "--tsconfig=", "tsconfig") ||
      string(arg, "--tsconfig-raw=", "tsconfigRaw") ||
      string(arg, "--entry-names=", "entryNames") ||
      string(arg, "--chunk-names=", "chunkNames") ||
      string(arg, "--asset-names=", "assetNames") ||
      pair(arg, "--define:", "define") ||
      append(arg, "--pure:", "pure") ||
      pair(arg, "--loader:", "loader" as Pair) ||
      string(arg, "--loader=", "loader" as Strings) ||
      string(arg, "--target=", "target") ||
      pair(arg, "--out-extension:", "outExtension") ||
      string(arg, "--platform=", "platform" as Strings) ||
      string(arg, "--format=", "format" as Strings) ||
      append(arg, "--external:", "external") ||
      append(arg, "--inject:", "inject") ||
      string(arg, "--jsx=", "jsx" as Strings) ||
      string(arg, "--jsx-factory=", "jsxFactory") ||
      string(arg, "--jsx-fragment=", "jsxFragment") ||
      string(arg, "--banner=", "banner" as Strings) ||
      string(arg, "--footer=", "footer" as Strings) ||
      pair(arg, "--banner:", "banner" as Pair) ||
      pair(arg, "--footer:", "footer" as Pair) ||
      number(arg, "--log-limit=", "logLimit") ||
      boolean(arg, "--color=", "color") ||
      string(arg, "--log-level=", "logLevel" as Strings) ||
      args.push(arg);
  }

  return options;
}

function dashize(s: string) {
  return s.replace(/([A-Z])/g, x => "-" + x.toLowerCase());
}

function isBuildOptions(
  options: BuildOptions | TransformOptions
): options is BuildOptions {
  return "entryPoints" in options || "plugins" in options;
}

/**
 * Convert argv to esbuild build options.
 * This function does not check any typo error, nor plugin support.
 *
 * NOTE: The args should not have `""` surroundings. e.g. use `--a=b c` to pass `--a="b c"`.
 * @example
 * argsToBuildOptions(["--target=es6"]) // { target: "es6" }
 */
export function argsToBuildOptions(args: string[]) {
  return parseAndRemoveArgs(args.slice());
}

/**
 * Convert esbuild build options to argv.
 * This function does not check any typo error, nor plugin support.
 *
 * NOTE: Result does not have `""` surroundings. e.g. it returns `--a=b c` instead of `--a="b c"`.
 * @example
 * buildOptionsToArgs({ target: "es6" }) // ["--target=es6"]
 */
export function buildOptionsToArgs(options: BuildOptions | TransformOptions) {
  const args: string[] = [];
  if (isBuildOptions(options)) {
    if (Array.isArray(options.entryPoints)) {
      args.push(...options.entryPoints);
    } else if (options.entryPoints) {
      args.push(
        ...Object.entries(options.entryPoints).map(([k, v]) => `${k}=${v}`)
      );
    }
    delete options.entryPoints;
    delete options.plugins;
  }
  for (const [k, v] of Object.entries(options)) {
    const key = dashize(k);
    if (Array.isArray(v)) {
      if (
        ["resolveExtensions", "mainFields", "conditions", "target"].includes(k)
      ) {
        args.push(`--${key}=${v.join(",")}`);
      } else {
        args.push(...v.map(value => `--${key}:${value}`));
      }
    } else if (key === "tsconfig-raw" && typeof v === "object") {
      args.push(`--${key}=${JSON.stringify(v)}`);
    } else if (typeof v === "object" && v !== null) {
      // --define:process.env={} --footer:js="// hello"
      args.push(
        ...Object.entries(v).map(([sub, val]) => `--${key}:${sub}=${val}`)
      );
    } else if (v === true) {
      args.push(`--${key}`);
    } else {
      args.push(`--${key}=${v}`);
    }
  }
  return args;
}
