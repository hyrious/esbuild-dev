#!/usr/bin/env node
console.log({ __dirname } as any);
console.log({ __filename } as any);
console.log({ ["import.meta.url"]: import.meta.url } as any);
console.log(process.env["TEST"]);
