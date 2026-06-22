## Why

После деплоя или локальной пересборки невозможно быстро понять, какая версия фронтенда и WASM-ядра сейчас в браузере. Нужна прозрачная привязка к последнему git-коммиту каждого слоя — для отладки, сверки артефактов и поддержки.

## What Changes

- Инъекция build info для фронтенда (`src/`) при dev и production-сборке Vite: compact UTC version (`YYYYMMDD.HHMMSS`) последнего коммита, затронувшего `src/`
- Compile-time build info для WASM-ядра (`crates/core/`) через `build.rs`: та же compact UTC version последнего коммита, затронувшего `crates/core/`
- Runtime API: `getFrontendBuildInfo()`, `getCoreBuildInfo()` (WASM), объединяющий `getBuildInfo()`
- UI-футер с отображением версий обоих слоёв
- Fallback `unknown` при отсутствии git или истории для path
- Документация в `devlog.md`

## Capabilities

### New Capabilities

_(нет новых capabilities — расширяем существующие спеки)_

### Modified Capabilities

- `vite-react-app`: отображение build info фронтенда и core в UI; runtime API `getFrontendBuildInfo` / `getBuildInfo`
- `rust-wasm-core`: экспорт `getCoreBuildInfo()` с JSON (`version` — compact UTC datetime последнего коммита в `crates/core/`)

## Impact

- `vite.config.ts` — Vite plugin для git-based define
- `src/buildInfo.ts` — новый модуль с типами и API
- `src/App.tsx` — футер с версиями
- `crates/core/build.rs` — новый, rustc-env из git
- `crates/core/src/lib.rs` — `getCoreBuildInfo()`
- `devlog.md` — описание build info и команд проверки
- Toolchain: git должен быть доступен при `npm run dev` / `npm run build` и при сборке WASM
