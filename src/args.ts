import { BuildOptions, TransformOptions } from "esbuild";

const cliRE = /^--([-a-z]+)(?::([^=]+))?(?:=(.+))?$/;
const booleans = { true: true, false: false } as const;

/**
 * Convert argv to esbuild build options.
 * This function does not check any typo error, nor plugin support.
 *
 * NOTE: The args should not have `""` surroundings. e.g. use `--a=b c` to pass `--a="b c"`.
 * @example
 * argsToBuildOptions(["--target=es6"]) // { target: "es6" }
 */
export function argsToBuildOptions(args: string[]) {
  const buildOptions: BuildOptions | TransformOptions = {};
  for (const arg of args) {
    const m = cliRE.exec(arg);
    if (m) {
      const [, slashKey, subKey, value] = m;
      const key = camelize(slashKey) as keyof typeof buildOptions;
      if (subKey && value) {
        // define, loader, banner, footer, stdin
        // their values are all string
        (buildOptions[key] ||= {} as any)[subKey] = value;
      } else if (subKey) {
        // pure, external, inject, tsconfig-raw
        // their values are all string
        (buildOptions[key] ||= [] as any).push(subKey);
      } else if (value) {
        // resolveExtensions, mainFields, conditions, target
        // their values can have ',' to become array
        // others are boolean | string
        const bool: boolean | undefined = booleans[value as keyof typeof booleans];
        if (bool !== undefined) {
          // --a=false
          buildOptions[key] = bool as any;
        } else if (value.includes(",")) {
          // --a=b,c
          buildOptions[key] = value.split(",") as any;
        } else {
          // --a=b
          buildOptions[key] = value as any;
        }
      } else {
        buildOptions[key] = true as any;
      }
    } else {
      throw new Error(`unknown arg: ${arg}`);
    }
  }
  return buildOptions;
}

function camelize(s: string) {
  return s.split("-").reduce((a, b) => a + capitalize(b));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
      args.push(...Object.entries(options.entryPoints).map(([k, v]) => `${k}=${v}`));
    }
    delete options.entryPoints;
    delete options.plugins;
  }
  for (const [k, v] of Object.entries(options)) {
    const key = dashize(k);
    if (Array.isArray(v)) {
      if (["resolveExtensions", "mainFields", "conditions", "target"].includes(k)) {
        args.push(`--${key}=${v.join(",")}`);
      } else {
        args.push(...v.map(value => `--${key}:${value}`));
      }
    } else if (key === "tsconfig-raw" && typeof v === "object") {
      args.push(`--${key}=${JSON.stringify(v)}`);
    } else if (typeof v === "object" && v !== null) {
      args.push(...Object.entries(v).map(([sub, val]) => `--${key}:${sub}=${JSON.stringify(val)}`));
    } else {
      args.push(`--${key}=${v}`);
    }
  }
  return args;
}

function dashize(s: string) {
  return s.replace(/([A-Z])/g, x => "-" + x.toLowerCase());
}

function isBuildOptions(options: BuildOptions | TransformOptions): options is BuildOptions {
  return "entryPoints" in options || "plugins" in options;
}
