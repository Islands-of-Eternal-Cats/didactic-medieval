npm install @fission-ai/openspec@latest 

node ./node_modules/@fission-ai/openspec/bin/openspec.js

## Vite + React

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview  # после build
```

## Rust / WASM toolchain

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack cargo-watch
```

## Rust / WASM

```bash
npm run build:wasm   # сборка crates/core → pkg/
npm run dev          # build:wasm + watch Rust + Vite
npm run build        # build:wasm + TypeScript + Vite production
```

Приветствие на странице берётся из `getProgramName()` в WASM-модуле `crates/core`.

## Build version

Номер версии каждого слоя — компактная дата-время UTC (`YYYYMMDD.HHMMSS`) последнего git-коммита, затронувшего этот слой:

- **frontend** — последний коммит по `src/`
- **core** — последний коммит по `crates/core/`

В футере приложения и через API (`getFrontendBuildInfo()`, `getCoreBuildInfo()`, `getBuildInfo()`).

Сверка с git:

```bash
TZ=UTC git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- src/
TZ=UTC git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- crates/core/
```

Если git недоступен — версия `unknown`.
