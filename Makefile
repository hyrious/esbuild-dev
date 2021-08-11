BASE=--bundle --target=node14.8 --outdir=dist
EXTERNAL=--platform=node --external:esbuild
SOURCEMAP=--minify-syntax --sourcemap --sources-content=false
FLAGS=${BASE} ${EXTERNAL} ${SOURCEMAP}
ESM=--format=esm --splitting --chunk-names=chunks/dep-[hash] --out-extension:.js=.mjs

all: dist/index.js dist/bin.mjs

dist/index.js: src/index.ts
	esbuild $^ ${FLAGS}

dist/bin.mjs: src/index.ts src/bin.ts src/args.ts
	esbuild $^ ${ESM} ${FLAGS}
