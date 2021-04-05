import { esbuildDev, esbuildRun } from ".";
import help from "./help.txt";
import { resolvePlugins } from "./utils";

const FlagHelp = "--help";
const FlagWatch = "--watch";
const FlagPlugins = ["-p", "--plugin"];

async function main() {
  let argv = process.argv.slice(2);
  const plugins = resolvePlugins(argv, FlagPlugins);
  const shouldHelp = argv.includes(FlagHelp);
  const shouldWatch = argv.indexOf(FlagWatch);

  if (shouldWatch !== -1) {
    argv.splice(shouldWatch, 1);
  }

  if (shouldHelp || !argv[0]) {
    return console.log(help);
  }

  if (shouldWatch !== -1) {
    await esbuildDev(argv[0], argv.slice(1), { plugins });
  } else {
    await esbuildRun(argv[0], argv.slice(1), { plugins });
  }
}

main().catch(console.error);
