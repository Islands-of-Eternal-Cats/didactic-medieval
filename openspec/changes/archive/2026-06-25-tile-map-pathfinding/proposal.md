## Why

Юниты в симуляции движутся по прямой к случайным точкам, игнорируя препятствия. Добавление сетки тайлов с проходимыми и непроходимыми ячейками и A* pathfinding позволит юнитам обходить препятствия, делая симуляцию визуально богаче и интереснее.

## What Changes

- Новый ECS-ресурс `TileMapResource` с сеткой 25×19 тайлов (32×32 px, поле 800×608)
- Генерация карты по seed: ~12% непроходимых тайлов через `StdRng`
- Новый модуль `pathfinding.rs` с A* на Manhattan distance
- Компонент `Target` → `Path { waypoints: Vec<(f32, f32)> }`
- Новая система `move_along_path` — движение по waypoints
- Новая система `find_path_action` — при `TargetReached`: генерация цели, A*, сохранение пути. Если путь не найден — ретаргет.
- Новый WASM метод `getTileMap()` — JSON с картой
- `createGameWorld(unit_count, seed)` теперь принимает seed для генерации карты
- Canvas-рендеринг: зелёные walkable тайлы, тёмные blocked, юниты поверх

## Capabilities

### New Capabilities
- `tile-map`: Tile map resource (25×19, 32×32 px), seed-based генерация, конвертация world/tile координат, WASM `getTileMap()` API, canvas-рендеринг тайлов
- `pathfinding`: A* поиск пути на сетке, компонент `Path`, системы `move_along_path` и `find_path_action`, ретаргет при недостижимой цели

### Modified Capabilities
- *(none — spec-level requirement changes are internal to rust-wasm-core and vite-react-app; delta specs not needed)*

## Impact

- `crates/core/src/pathfinding.rs` — новый файл
- `crates/core/src/components.rs` — `Target` → `Path`
- `crates/core/src/resources.rs` — +`TileMapResource`
- `crates/core/src/systems.rs` — +`move_along_path`, +`find_path_action`
- `crates/core/src/world.rs` — генерация `TileMap`, обновлён schedule
- `crates/core/src/lib.rs` — +`getTileMap` на GameWorld
- `src/UnitsCanvas.tsx` — рендеринг тайлов на canvas, вызов `getTileMap()`
- `src/App.tsx` — передача seed в `createGameWorld`
- `Cargo.toml` — возможно новая зависимость (если A* потребует доп. крейтов — но реализуем вручную)
