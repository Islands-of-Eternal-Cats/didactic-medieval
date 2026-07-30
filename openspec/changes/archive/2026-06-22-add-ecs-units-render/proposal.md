## Why

Сейчас `crates/core` — тонкая WASM-обёртка с `getProgramName()` и build info. Для didactic-medieval нужен первый игровой слой: ECS в Rust как источник истины, сущности с позициями и визуализация на фронте. Это проверяет полный цикл «логика в WASM → данные в JS → отрисовка в React» и закладывает основу для дальнейшей игровой логики.

## What Changes

- Добавить `bevy_ecs` (и минимальные зависимости) в `crates/core`
- ECS `World`: компонент `Position`, спавн N юнитов со случайными координатами в заданных границах поля
- WASM API: `createGameWorld(unitCount, seed)` и `getUnitPositions()` (JSON-массив `{ id, x, y }`)
- React: отрисовка юнитов на `<canvas>` (800×600 логических пикселей), кнопка «перегенерировать» с новым seed
- Сохранить существующие API (`getProgramName`, `getCoreBuildInfo`)
- Обновить `devlog.md`

## Capabilities

### New Capabilities

_(нет — расширяем существующие спеки)_

### Modified Capabilities

- `rust-wasm-core`: ECS-мир с юнитами, спавн со случайными позициями, экспорт позиций через WASM API
- `vite-react-app`: canvas-визуализация юнитов из WASM, кнопка перегенерации

## Impact

- `crates/core/Cargo.toml`, `crates/core/src/` — новые модули ECS и WASM-экспорт
- `Cargo.toml` — workspace dependencies (`bevy_ecs`, `rand`)
- `src/App.tsx`, новый компонент canvas-отрисовки
- Размер WASM и время сборки вырастут; зафиксировать версии зависимостей
