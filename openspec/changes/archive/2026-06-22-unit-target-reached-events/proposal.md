## Why

Система движения сейчас смешивает перемещение юнита и назначение новой цели в одной функции. Это затрудняет расширение логики прибытия (AI, статистика, анимации). Разделение через ECS event bus заложит основу для независимых реакций на событие «юнит достиг цели».

## What Changes

- Добавить событие `TargetReached { entity }` и ресурс `Events<TargetReached>` в ECS world
- Разделить монолитную `move_towards_target` на две системы: движение (отправляет событие) и `assign_random_target` (читает событие, назначает цель)
- Добавить ресурсы `SimulationRng` и `DeltaTime` в world (RNG переносится из поля `GameWorld`)
- Добавить `Schedule` в `GameWorld` для запуска систем в порядке: move → assign → flush events
- Поведение снаружи не меняется: WASM API (`tick`, `getUnitPositions`) и фронт без изменений

## Capabilities

### New Capabilities

_(нет — расширяем существующие спеки)_

### Modified Capabilities

- `rust-wasm-core`: movement system отправляет `TargetReached` вместо прямого переназначения цели; добавляется система `assign_random_target`, запуск через `Schedule`

## Impact

- `crates/core/src/events.rs` (новый) — тип события `TargetReached`
- `crates/core/src/resources.rs` (новый) — `SimulationRng`, `DeltaTime`
- `crates/core/src/systems.rs` — две ECS-системы вместо одной функции
- `crates/core/src/world.rs` — `Schedule`, инициализация events/resources, обновлённый `tick`
- `crates/core/src/lib.rs` — новые модули
- `devlog.md` — описание event-driven архитектуры
- Без новых зависимостей; фронт и WASM API без изменений
