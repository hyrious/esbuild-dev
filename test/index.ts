export const a = 42;
export default 1;

console.log("import.meta =", import.meta);
if (require.main) {
  console.log("require.main === module", require.main === module);
  console.log("__filename =", __filename);
} else {
  console.log("require =", require);
}
