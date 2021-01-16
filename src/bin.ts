import minimist from "minimist";
import { esbuildDev, esbuildRun } from ".";
import help from "./help.txt";

async function main() {
    const argv = minimist(process.argv.slice(2));

    // esbuild-dev --run main.ts
    if (argv.run) {
        return await esbuildRun(argv.run, argv._);
    }

    // esbuild-dev main.ts
    const [filename, ...args] = argv._;

    if (!filename) {
        return console.log(help);
    }

    await esbuildDev(filename, args);
}

main().catch(console.error);
