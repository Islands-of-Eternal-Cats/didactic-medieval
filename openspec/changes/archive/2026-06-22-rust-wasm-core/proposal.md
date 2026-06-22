## Why

Приложение показывает «Hello World» как жёстко зашитую строку в React. Для didactic-medieval нужна проверяемая связка TypeScript ↔ Rust через WebAssembly — минимальный Rust-модуль с одной API-функцией задаёт основу для последующей логики на Rust без перестройки репозитория.

## What Changes

- Добавить Cargo workspace в корне репозитория с member-crate `crates/core`
- Собрать `crates/core` в WASM через `wasm-pack`; экспорт `getProgramName()` → `"Hello World"`
- Подключить WASM в Vite + React: `App.tsx` отображает строку из `getProgramName()`, не литерал
- npm-скрипты: `build:wasm`, `dev:wasm` (watch через `cargo watch` + `wasm-pack`), обновить `dev` и `build`
- Обновить `.gitignore` (`pkg/`, `target/`)
- Задокументировать toolchain и команды в `devlog.md`

## Capabilities

### New Capabilities

- `rust-wasm-core`: Cargo workspace, WASM crate `crates/core`, сборка в `pkg/`, API `getProgramName()`

### Modified Capabilities

- `vite-react-app`: приветствие на главной странице берётся из WASM-модуля, а не из захардкоженного текста в React

## Impact

- Новые файлы: `Cargo.toml`, `crates/core/`, артефакт `pkg/` (не в git)
- Dev-зависимость npm: `concurrently`
- Toolchain: Rust, `wasm32-unknown-unknown`, `wasm-pack`, `cargo-watch`
- `src/App.tsx`, `package.json`, `.gitignore`, `devlog.md`
- Существующий OpenSpec workflow не затрагивается
