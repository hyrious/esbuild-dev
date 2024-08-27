// node dist/bin.js --cache test/cache.ts
import * as dep from "./cache.dep";
console.log(structuredClone(dep));
