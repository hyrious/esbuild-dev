// run node dist/bin.js test/throw.ts
// should print the typescript source content

const message: string = "Hello, world!";
throw new Error(message as never);
