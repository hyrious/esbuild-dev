import { version as esbuild_version } from "esbuild";
import { name, version as self_version } from "../package.json";
import { defaultCommand } from "./commands/default";
import { externalCommand } from "./commands/external";
import { tempDirectory } from "./index.js";
import helpText from "./help.txt";

const args = process.argv.slice(2);

const commands = ["external", "temp", "tmp"];

// pre-process the command, entry, help, version
const command = commands.includes(args[0]) && args.shift();

let argsBeforeEntry: string[] = [];
let argsAfterEntry: string[] = [];
let entry: string | undefined;
let help = false;
let version = false;
let cwd = process.cwd();
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
  if (arg.startsWith("--cwd=")) {
    cwd = arg.slice("--cwd=".length);
  }
  argsBeforeEntry.push(arg);
}

if (command === "temp" || command === "tmp") {
  console.log(tempDirectory(cwd));
  process.exit(0);
}

if (version) console.log(`${name} ${self_version}, esbuild ${esbuild_version}`);
if (help || (!version && !entry)) console.log(helpText);
if (help || !entry || version) process.exit(0);

const entryPoint = entry!;

if (command === "external") {
  await externalCommand(entryPoint, argsBeforeEntry, argsAfterEntry);
} else {
  await defaultCommand(entryPoint, argsBeforeEntry, argsAfterEntry);
}
