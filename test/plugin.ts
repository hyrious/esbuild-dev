// node dist/bin.mjs -p:./test/plugin.ts test/index.ts
import { Plugin } from "esbuild";
import { readFile } from "fs/promises";

export default function example(): Plugin {
  return {
    name: "example",
    setup({ onStart, onEnd, onResolve, onLoad }) {
      onStart(() => {
        console.log("[example-plugin] on start");
      });
      onEnd(() => {
        console.log("[example-plugin] on end");
      });
      onResolve({ filter: /.*/ }, args => {
        console.log("[example-plugin] resolve", args.path);
        return undefined;
      });
      onLoad({ filter: /\.m?tsx?$/ }, async args => {
        console.log("[example-plugin] load", args.path);
        let contents = await readFile(args.path, "utf-8");
        contents += `\nconsole.log("this file has been hooked by example plugin!")`;
        return { contents, loader: "default" };
      });
    },
  };
}
