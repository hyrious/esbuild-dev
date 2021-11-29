// node dist/bin.js --define:__ESM__=true test/index.ts

import { importFile, requireFile } from "../src";

console.log("importFile:", await importFile("./test/lib.ts"));
console.log("requireFile:", await requireFile("./test/lib.ts"));
