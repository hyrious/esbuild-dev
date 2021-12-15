import { URL } from "url";

export * from "./internal";

export let loaderPath: string;
if (__ESM__) {
  loaderPath = new URL("./loader.mjs", import.meta.url).pathname;
} else {
  loaderPath = require.resolve("./loader.mjs");
}
