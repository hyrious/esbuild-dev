// run node dist/bin.mjs test/argv.ts --help
// should return ["--help"]

console.log(process.argv.slice(2));
