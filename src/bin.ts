import { esbuildDev, esbuildRun } from ".";
import help from "./help.txt";
import { argv2config, resolveExternal, resolvePlugins } from "./utils";
import { BuildOptions, buildSync } from "esbuild";

const FlagHelp = "--help";
const FlagWatch = "--watch";
const FlagBuild = "--build";
const FlagPlugins = ["-p", "--plugin"];

async function main() {
  let argv = process.argv.slice(2);
  const plugins = resolvePlugins(argv, FlagPlugins);
  const shouldHelp = argv.includes(FlagHelp);
  const shouldWatch = argv.indexOf(FlagWatch);
  const shouldBuild = argv.indexOf(FlagBuild);

  if (shouldWatch !== -1) {
    argv.splice(shouldWatch, 1);
  }

  if (shouldHelp || !argv[0]) {
    return console.log(help);
  }

  if (shouldBuild !== -1) {
    argv.splice(shouldBuild, 1);
    let binOptions = {};
    if (argv[0].includes("bin")) {
      binOptions = { banner: { js: "#!/usr/bin/env node" } };
    }
    const buildOptions: BuildOptions = {
      entryPoints: [argv[0]],
      external: await resolveExternal(argv[0], false),
      platform: "node",
      target: "node12",
      bundle: true,
      minify: true,
      sourcemap: true,
      outdir: "dist",
      ...binOptions,
      ...argv2config(argv.slice(1)),
    }
    if (buildOptions.outdir && buildOptions.outfile) {
      // Cannot use both "outfile" and "outdir"
      delete buildOptions.outdir;
    }
    buildSync(buildOptions);
    return;
  }

  if (shouldWatch !== -1) {
    await esbuildDev(argv[0], argv.slice(1), { plugins });
  } else {
    await esbuildRun(argv[0], argv.slice(1), { plugins });
  }
}

main().catch(console.error);
