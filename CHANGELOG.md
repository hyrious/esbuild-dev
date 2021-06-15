# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.3.5] - 2021-06-15
### Fixed
- Incorrect watch files on first run.

## [0.3.4] - 2021-06-15
### Fixed
- `lookupFile` typo error.

## [0.3.3] - 2021-06-08
### Changed
- Support `--cjs` for `require.resolve` usage.

## [0.3.2] - 2021-06-01
### Fixed
- Remove `--enable-source-maps` in its bin file to prevent GitHub Action error.

## [0.3.1] - 2021-05-31
### Changed
- **[Breaking]** The outfile format is changed to `esm`.
  - `__filename` replacement is preserved for compatibility.
  - `require()` will throw error, use `import` instead.
- Deps are discovered through esbuild metafile instead of scanning `import` by hand.
- Export names are changed: `esbuildRun` &rarr; `runFile`, `esbuildDev` &rarr; `watchFile`.

## 0.2.8 - 2021-05-18
### Added
- Bundle entry point to `node_modules/.esbuild-dev/file.js` and run it.
- Watch and rebuild incrementally and rerun.
- Shortcut to call `esbuild --bundle`.
- Plugins support.

[Unreleased]: https://github.com/hyrious/esbuild-dev/compare/v0.3.5...HEAD
[0.3.5]: https://github.com/hyrious/esbuild-dev/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/hyrious/esbuild-dev/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/hyrious/esbuild-dev/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/hyrious/esbuild-dev/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/hyrious/esbuild-dev/compare/v0.2.8...v0.3.1
