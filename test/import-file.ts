// node dist/bin.js test/import-file.ts
import { importFile, requireFile } from "../dist/index.js";

requireFile("test/plugin.ts").then(console.log);
importFile("test/plugin.ts?t=1").then(console.log);
