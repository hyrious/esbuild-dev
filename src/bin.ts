import { version as esbuildVersion } from "esbuild";
import { argv, exit } from "process";
import { name, version as versionText } from "../package.json";
import { defaultCommand } from "./commands/default";
import { externalCommand } from "./commands/external";
import helpText from "./help.txt";

const args = argv.slice(2);

const commands = ["external"];

// pre-process the command, entry, help, version
const command = commands.includes(args[0]) && args.shift();

export let argsBeforeEntry: string[] = [];
export let argsAfterEntry: string[] = [];
let entry: string | undefined;
let help = false;
let version = false;
for (let i = 0; i < args.length; ++i) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") {
    help = true;
    continue;
  }
  if (arg === "--version" || arg.toLowerCase() === "-v") {
    version = true;
    continue;
  }
  if (arg[0] !== "-") {
    entry = arg;
    argsAfterEntry = args.slice(i + 1);
    break;
  }
  argsBeforeEntry.push(arg);
}

if (version) console.log(`${name} ${versionText}, esbuild ${esbuildVersion}`);
if (help || (!version && !entry)) console.log(helpText);
if (help || !entry || version) exit(0);

export const entryPoint = entry!;

if (command === "external") {
  await externalCommand(entryPoint, argsBeforeEntry, argsAfterEntry);
} else {
  await defaultCommand(entryPoint, argsBeforeEntry, argsAfterEntry);
}
