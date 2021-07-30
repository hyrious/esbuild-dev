import cp, { ChildProcess } from "child_process";
import { BuildOptions, Plugin } from "esbuild";
import { argsToBuildOptions, external } from ".";
import { build, errorMessage, Format } from "./build";
import document from "./help.txt";
import { loadPlugin } from "./plugin";
import { isFile } from "./utils";

if (process.argv[2] === "external") {
  let [file, ...args] = process.argv.slice(3);
  if (!file || !isFile(file)) {
    console.log(document);
  } else {
    try {
      console.log(await external(file, {}, argsToBuildOptions(args)));
    } catch {}
  }
  process.exit(0);
}

let format: Format = "esm";
let entry = "";
let args: string[] = [];
let watch = false;
let plugins: Plugin[] = [];

let help = false;
let pluginName: string, plugin: any;
for (const arg of process.argv.slice(2)) {
  if (arg === "--help") {
    help = true;
    break;
  } else if (arg === "--cjs") {
    format = "cjs";
  } else if (arg === "--watch" || arg === "-w") {
    watch = true;
  } else if (arg.startsWith("--plugin:") || arg.startsWith("-p:")) {
    if ((pluginName = arg.slice(arg.indexOf(":") + 1))) {
      if ((plugin = await loadPlugin(pluginName))) {
        plugins.push(plugin);
      }
    }
  } else if (!entry && !arg.startsWith("-")) {
    entry = arg;
  } else {
    args.push(arg);
  }
}
if (help || !entry) {
  console.log(document);
  process.exit(0);
}

let outfile: string;
let stop: (() => void) | undefined;
let child: ChildProcess | undefined;

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const kill = async () => {
  if (child) {
    child.kill("SIGTERM");
    await delay(200);
    if (child && !child.killed) {
      child.kill("SIGKILL");
      await delay(100);
    }
  }
};
const run = async () => {
  try {
    await kill();
    child = cp.spawn(process.argv0, ["--enable-source-maps", outfile, ...args], {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
    });
    child.on("close", code => {
      watch && console.log("[esbuild-dev] child process stopped with code", code);
      child = undefined;
    });
    child.on("error", () => {
      console.error(errorMessage(outfile, args));
      kill();
    });
  } catch {
    console.log(errorMessage(outfile, args));
    child = undefined;
  }
};

const options: BuildOptions = { plugins };
if (watch) {
  options.watch = {
    onRebuild(_error, result) {
      if (result) ({ stop } = result), run();
    },
  };
}

// prettier-ignore
({ outfile, result: { stop } } = await build(entry, format, options));
run();

if (watch) {
  process.stdin.on("data", async e => {
    if (e.toString().startsWith("exit")) {
      await kill();
      stop?.();
      process.exit(0);
    }
  });
}
