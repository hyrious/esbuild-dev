import { BuildOptions } from "esbuild";

const cliRE = /^--([-a-z]+)(?::([^=]+))?(?:=(.+))?$/;
const booleans = { true: true, false: false } as const;

/**
 * Convert argv to esbuild build options.
 * This function does not check any typo error, nor plugin support.
 * @example
 * argsToBuildOptions(["--target=es6"]) // { target: "es6" }
 */
export function argsToBuildOptions(args: string[]) {
  const buildOptions: BuildOptions = {};
  for (const arg of args) {
    const m = cliRE.exec(arg);
    if (m) {
      const [, slashKey, subKey, value] = m;
      const key = camelize(slashKey) as keyof BuildOptions;
      if (subKey && value) {
        // define, loader, banner, footer, stdin
        // their values are all string
        (buildOptions[key] ||= {} as any)[subKey] = value;
      } else if (subKey) {
        // pure, external, inject
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
