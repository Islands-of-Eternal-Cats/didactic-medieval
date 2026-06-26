## Why

Колонисты сейчас бесцельно блуждают по карте — у них нет потребностей и нет возможности взаимодействовать с миром. Это делает симуляцию пустой. Добавление базовых потребностей (еда, сон) и минимального строительства даст фундамент для осмысленного геймплея.

## What Changes

- ECS: новые компоненты (`Satiation`, `Energy`, `NeedsPlan`, `HungryDebuff`, `TiredDebuff`), ресурс (`MapObjects`), события (`Hungry`, `Tired`, `Sated`, `Rested`, `BuildRequest`)
- ECS: системы для аккурации потребностей, проверки порогов, принятия решений (поиск ближайшего костра/кровати), выполнения плана (движение к цели + восстановление), и обработки строительства
- ECS: модификация `find_path_action` — пропускать поиск случайной цели, если активен `NeedsPlan`
- WASM API: новые методы `getUnitStates()`, `build()`, `getMapObjects()`
- Фронтенд: панель инструментов для выбора режима строительства (стена, кровать, костёр), клик по тайлу для постройки, рендеринг построек, иконки статусов голода/усталости

## Capabilities

### New Capabilities
- `needs`: система потребностей колонистов — сытость и бодрость, автономное удовлетворение через поиск объектов на карте
- `building`: строительство объектов (стена, кровать, костёр) через клик по тайлу с визуальной обратной связью

### Modified Capabilities
*(нет изменений в существующих spec'ах)*

## Impact

- `crates/core/src/components.rs` — 4 новых компонента, 1 enum
- `crates/core/src/resources.rs` — новый ресурс `MapObjects` с enum `ObjectKind`
- `crates/core/src/events.rs` — 5 новых сообщений
- `crates/core/src/systems.rs` — 4 новые системы, модификация `find_path_action`
- `crates/core/src/world.rs` — новые `init_resource`, `insert_resource`, изменение `create_game_world` и `tick`, новые wasm-методы
- `src/UnitsCanvas.tsx` — передача buildMode, обработка кликов по тайлу
- `src/App.tsx` — добавление `BuildToolbar`
- `src/render/SceneRenderer.ts` — новый слой `buildings`
- `package.json` — без изменений
- `Cargo.toml` — без изменений (все зависимости уже есть)
