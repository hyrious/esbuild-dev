BASE=--bundle --log-level=warning --target=node14.8
EXTERNAL=--platform=node --external:esbuild
SOURCEMAP=--sourcemap --sources-content=false
FLAGS=${BASE} ${EXTERNAL} ${SOURCEMAP}
ESM=--format=esm

all: dist/index.js dist/index.mjs dist/bin.mjs

dist/index.js: src/index.ts
	esbuild $^ --outfile=$@ ${FLAGS}

dist/index.mjs: src/index.ts
	esbuild $^ ${ESM} --outfile=$@ ${FLAGS}

dist/bin.mjs: src/bin.ts
	esbuild $^ ${ESM} --banner:js="#!/usr/bin/env node" --outfile=$@ ${FLAGS}

.PHONY: test
test: dist/bin.mjs
	@echo ""; echo Run test/index.ts in ESM mode
	@node --enable-source-maps $^ test/index.ts -p:./test/example-plugin.ts
	@echo ""; echo Run test/index.ts in CJS mode
	@node --enable-source-maps $^ --cjs test/index.ts -p:./test/example-plugin.ts
