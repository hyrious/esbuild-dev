import minimist from "minimist";
import { esbuildRun } from ".";

async function main() {
    const args = minimist(process.argv.slice(2));

    // esbuild-dev --run main.ts
    if (args.run) {
        await esbuildRun(args.run, args._);
    }
}

main().catch(console.error);
