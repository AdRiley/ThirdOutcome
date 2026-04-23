# ThirdOutcome

[![CI](https://github.com/AdRiley/ThirdOutcome/actions/workflows/ci.yml/badge.svg)](https://github.com/AdRiley/ThirdOutcome/actions/workflows/ci.yml)

Electron + TypeScript desktop foundation for local CSV analytics with DuckDB and LLM-generated SQL.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run dist`

## Structure

- `electron/main.ts`: Electron main process and window bootstrapping
- `electron/preload.ts`: secure preload bridge exposed to the renderer
- `src/renderer/main.ts`: renderer entrypoint
- `src/renderer/styles.css`: starter UI styling
