// run node dist/bin.mjs test/packages/test.ts
// should return ["@hyrious/esbuild-dev", ...]

import { lookupExternal } from "../../src/utils";

console.log(lookupExternal("./test/packages/package.json"));
