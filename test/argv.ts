// run node dist/bin.mjs test/argv.ts --help
// should return ["--help"]

import { argsToBuildOptions, buildOptionsToArgs } from "../src/args";

let args = process.argv.slice(2);
let options = argsToBuildOptions(args);
console.log(args);
console.log(options);
console.log(buildOptionsToArgs(options));
