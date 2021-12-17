import { URL } from "url";

export * from "./types";
export * from "./external";
export * from "./build";
export * from "./utils";
export { version } from "../../package.json";

export let loaderPath: string;
if (__ESM__) {
  loaderPath = new URL("./loader.mjs", import.meta.url).pathname;
} else {
  loaderPath = require.resolve("./loader.mjs");
}
