import { Plugin } from "esbuild";

export function example(): Plugin {
  return {
    name: "example",
    setup({ onStart, onEnd }) {
      onStart(() => {
        console.log("example plugin: onStart");
      });
      onEnd(() => {
        console.log("example plugin: onEnd");
      });
    },
  };
}
