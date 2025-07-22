// node dist/bin.js -p:http test/http.ts
// @ts-ignore
import unescape from "https://esm.sh/lodash/unescape";

console.log(unescape("&lt;script&gt;"));
