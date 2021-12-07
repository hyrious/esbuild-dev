import { ChildProcess, spawn } from "child_process";
import { BuildOptions, Plugin, version as esbuildVersion } from "esbuild";
import { existsSync, statSync } from "fs";
import { argv, argv0, cwd, env, exit, stdin } from "process";
import {
  argsToBuildOptions,
  build,
  external,
  Format,
  loadPlugin,
  parseAndRemoveArgs,
  version,
} from ".";
import document from "./help.txt";

function isFile(file: string) {
  return existsSync(file) && statSync(file).isFile();
}

const error = `
[esbuild-dev] something went wrong on spawn node process
              but you can try to run the file by hand:

    > node --enable-source-maps {file} {args}
`;

function errorMessage(file: string, args: string[]) {
  const tpl = { file, args: args.map(e => JSON.stringify(e)).join(" ") };
  return error.replace(/{(\w+)}/g, (_, key: "file" | "args") => tpl[key] || "");
}

async function main() {
  let format: Format = "esm";
  let entry = "";
  let args: string[] = [];
  let watch = false;
  let plugins: Promise<Plugin>[] = [];
  let options: BuildOptions = {};

  let help = false;
  let version_ = false;
  let pluginText: string;
  for (const arg of argv.slice(2)) {
    if (entry) {
      args.push(arg);
    } else if (arg === "--help") {
      help = true;
      break;
    } else if (arg === "--version" || arg === "-v") {
      version_ = true;
    } else if (arg === "--cjs") {
      format = "cjs";
    } else if (arg === "--watch" || arg === "-w") {
      watch = true;
    } else if (arg.startsWith("--plugin:") || arg.startsWith("-p:")) {
      if ((pluginText = arg.slice(arg.indexOf(":") + 1))) {
        plugins.push(loadPlugin(pluginText));
      }
    } else if (!entry && !arg.startsWith("-")) {
      options = parseAndRemoveArgs(args) as BuildOptions;
      entry = arg;
    } else {
      args.push(arg);
    }
  }
  if (version_ && !help) {
    console.log(`esbuild-dev ${version}, esbuild ${esbuildVersion}`);
    exit(0);
  }
  if (help || !entry) {
    console.log(document);
    exit(0);
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
      child = spawn(argv0, ["--enable-source-maps", outfile, ...args], {
        stdio: "inherit",
        cwd: cwd(),
        env,
      });
      child.on("close", code => {
        watch &&
          console.log("[esbuild-dev] child process stopped with code", code);
        child = undefined;
      });
      child.on("error", () => {
        console.error(errorMessage(outfile, args));
        kill();
      });
    } catch {
      console.error(errorMessage(outfile, args));
      child = undefined;
    }
  };

  options.plugins = await Promise.all(plugins);

  if (watch) {
    options.watch = {
      onRebuild(_error, result) {
        if (result) ({ stop } = result), run();
      },
    };
  }

  try {
    ({
      outfile,
      result: { stop },
    } = await build(entry, { ...options, format }));
  } catch {
    exit(1);
  }
  run();

  if (watch) {
    stdin.on("data", async e => {
      if (e.toString().startsWith("exit")) {
        await kill();
        stop?.();
        exit(0);
      }
    });
  }
}

if (argv[2] === "external") {
  let bare = false;
  let [file, ...args] = argv.slice(3).filter(arg => {
    if (arg === "--bare" || arg === "-b") {
      bare = true;
      return false;
    }
    return true;
  });
  if (!file || !isFile(file)) {
    console.log(document);
  } else {
    // make sure to show the error message of `argsToBuildOptions`
    const buildOptions = argsToBuildOptions(args) as BuildOptions;
    external(file, buildOptions)
      .then(result => console.log(bare ? result.join("\n") : result))
      .catch(() => {});
  }
} else {
  main();
}
