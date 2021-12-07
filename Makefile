BASE=--bundle --target=node16.13 --outdir=dist --tree-shaking=true
EXTERNAL=--platform=node --external:esbuild
SOURCEMAP=--minify-syntax --sourcemap --sources-content=false
FLAGS=${BASE} ${EXTERNAL} ${SOURCEMAP}
ESM=--format=esm --define:__ESM__=true --out-extension:.js=.mjs --splitting --chunk-names=chunks/dep-[hash]
CJS=--format=cjs --define:__ESM__=false
BIN=--banner:js="\#!/usr/bin/env node"

.PHONY: all
all: dist/index.js dist/bin.js dist/index.mjs

dist/index.js: src/index.ts
	esbuild $^ ${CJS} ${FLAGS}

dist/bin.js: src/bin.ts
	esbuild $^ ${CJS} ${FLAGS} ${BIN}

dist/index.mjs: src/index.ts src/args.ts
	esbuild $^ ${ESM} ${FLAGS}
