import { esbuildDev, esbuildRun } from ".";
import help from "./help.txt";

const FlagHelp = "--help";
const FlagWatch = "--watch";

async function main() {
    let argv = process.argv.slice(2);
    const shouldHelp = argv.includes(FlagHelp);
    const shouldWatch = argv.indexOf(FlagWatch);

    if (shouldWatch !== -1) {
        argv.splice(shouldWatch, 1);
    }

    if (shouldHelp || !argv[0]) {
        return console.log(help);
    }

    if (shouldWatch !== -1) {
        await esbuildDev(argv[0], argv.slice(1));
    } else {
        await esbuildRun(argv[0], argv.slice(1));
    }
}

main().catch(console.error);
