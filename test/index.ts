export const a = 42;
import { external, platform } from "../src";
export default 1;

console.log("import.meta =", import.meta);
if (require.main) {
  console.log("require.main === module", require.main === module);
  console.log("__filename =", __filename);
} else {
  console.log("require =", require);
  external("./test/external.ts").then(e => {
    console.log("test external():", e);
  });
  platform("./test/external.ts").then(e => {
    console.log("test platform():", e);
  });
}
