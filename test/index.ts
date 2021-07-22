export const a = 42;
import { external } from "../src";
export default 1;

console.log("import.meta =", import.meta);
if (require.main) {
  console.log("require.main === module", require.main === module);
  console.log("__filename =", __filename);
} else {
  console.log("require =", require);
  external("./test/external.ts").then(console.log);
}
