export function noop() {}

export function isObj(o: any): o is Record<string, any> {
  return typeof o === "object" && o !== null;
}

export function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}
