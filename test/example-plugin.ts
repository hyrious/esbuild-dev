import { Plugin } from "esbuild";

export default function example(): Plugin {
  return {
    name: "example",
    setup({ onStart, onEnd, onResolve, onLoad }) {
      onStart(() => {
        console.log("[example-plugin]: on start");
      });
      onEnd(() => {
        console.log("[example-plugin]: on end");
      });
      onResolve({ filter: /.*/ }, args => {
        console.log("[example-plugin] resolve", args.path);
        return undefined;
      });
      onLoad({ filter: /.*/ }, args => {
        console.log("[example-plugin] load", args.path);
        return undefined;
      });
    },
  };
}
