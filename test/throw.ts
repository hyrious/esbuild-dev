// run node dist/bin.mjs test/throw.ts
// should print the typescript source content

const message: string = "Hello, world!";
throw new Error(message as never);
