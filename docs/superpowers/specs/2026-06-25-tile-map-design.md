# 2D Tile Map с A* Pathfinding

## Обзор

Добавление сетки проходимых/непроходимых тайлов в существующую ECS-симуляцию юнитов. Юниты используют A* для обхода препятствий.

## TileMap (новый ресурс ECS)

```rust
pub struct TileMapResource {
    pub tiles: Vec<bool>,    // true = walkable, false = blocked
    pub cols: u32,           // 25
    pub rows: u32,           // 19
    pub tile_size: u32,      // 32
}
```

- 25 col × 19 row, 32×32 px, поле 800×608
- Генерация по seed: ~12% непроходимых тайлов через StdRng
- Методы конвертации world ↔ tile координаты

## A* pathfinding (новый модуль `pathfinding.rs`)

- `pub fn astar(start: (u32, u32), goal: (u32, u32), tile_map: &TileMapResource) -> Option<Vec<(u32, u32)>>`
- Manhattan distance heuristic
- Поиск на сетке 25×19 — сверхбыстро

## Unit path following (изменение движения)

- Компонент `Target` → `Path { waypoints: Vec<(f32, f32)> }`
- Система `move_along_path` — двигает юнита по waypoints, при пустом пути → `TargetReached`
- Система `find_path_action` — при `TargetReached`: генерирует цель, запускает A*, сохраняет путь. Если путь не найден — ретаргет.

## Фронтенд

- Новый WASM метод `getTileMap()` — JSON: `{ "cols": 25, "rows": 19, "tiles": ["GGGG...", ...] }`
- Canvas: зелёные walkable, тёмные blocked, юниты поверх
- Поле 800×608

## WASM API

- `createGameWorld(unit_count, seed)` — seed для генерации карты
- `getTileMap()` — новый метод GameWorld
- `getUnitPositions()`, `tick()` — без изменений

## Изменения в crate

- Новый файл: `crates/core/src/pathfinding.rs`
- `components.rs`: Target → Path
- `resources.rs`: + TileMapResource
- `systems.rs`: move_along_path, find_path_action
- `world.rs`: генерация TileMap, обновлён schedule
