## Why

Сейчас юниты спавнятся со случайными позициями и остаются неподвижными — ECS используется только как хранилище данных. Чтобы проверить игровой цикл «симуляция → экспорт → отрисовка» и заложить основу для AI, нужно добавить цель движения и систему, которая обновляет позиции каждый тик.

## What Changes

- Добавить ECS-компонент `Target` (целевая позиция `x`, `y`) для каждого юнита
- При спавне назначать каждому юниту случайную цель в границах поля (800×600), детерминированно от `seed`
- Добавить ECS-компонент `Speed` (скорость движения в пикселях/сек)
- Добавить ECS-систему `move_towards_target`, которая сдвигает `Position` к `Target` с учётом `Speed` и `delta_time`
- Добавить WASM API `tick(deltaMs)` для продвижения симуляции на один шаг
- React: анимационный цикл (`requestAnimationFrame`) — вызов `tick` и перерисовка canvas
- При достижении цели — назначать новую случайную цель (циклическое блуждание)
- Сохранить существующие API (`getProgramName`, `getCoreBuildInfo`, `createGameWorld`, `getUnitPositions`)

## Capabilities

### New Capabilities

_(нет — расширяем существующие спеки)_

### Modified Capabilities

- `rust-wasm-core`: компоненты `Target` и `Speed`, система движения, `tick(deltaMs)` API, переназначение цели при достижении
- `vite-react-app`: анимационный цикл с `requestAnimationFrame`, вызов `tick` и перерисовка canvas

## Impact

- `crates/core/src/components.rs` — новые компоненты `Target`, `Speed`
- `crates/core/src/systems.rs` (новый) — система `move_towards_target`
- `crates/core/src/world.rs` — спавн с целью, хранение RNG, метод `tick`
- `src/UnitsCanvas.tsx` — RAF-цикл вместо статичной отрисовки
- Без новых зависимостей (используются `bevy_ecs`, `rand`)
