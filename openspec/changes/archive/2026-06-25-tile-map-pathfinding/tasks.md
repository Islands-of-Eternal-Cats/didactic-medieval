## 1. Rust core: Tile map resource and generation

- [x] 1.1 Add `TileMapResource` struct to `resources.rs` (tiles: Vec<bool>, cols: u32, rows: u32, tile_size: u32) with world-to-tile and tile-to-world conversion methods
- [x] 1.2 Add tile map generation logic: ~12% blocked tiles via `StdRng` with seed
- [x] 1.3 Update `FIELD_HEIGHT` from 600 to 608 (19 rows × 32 px) in `world.rs`
- [x] 1.4 Update `createGameWorld` to generate `TileMapResource` and insert into ECS world, pass seed to tile generation

## 2. Rust core: A* pathfinding

- [x] 2.1 Create new module `pathfinding.rs` with `pub fn astar(start, goal, tile_map) -> Option<Vec<(u32, u32)>>` using BinaryHeap + Manhattan distance
- [x] 2.2 Register `mod pathfinding` in `lib.rs`

## 3. Rust core: Path component and systems

- [x] 3.1 Replace `Target` component with `Path { waypoints: Vec<(f32, f32)> }` in `components.rs`
- [x] 3.2 Implement `move_along_path` system: move toward first waypoint, pop on arrival, send `TargetReached` when path empty
- [x] 3.3 Implement `find_path_action` system: on `TargetReached`, pick random tile, run A*, convert to world waypoints, write to Path; retarget on failure
- [x] 3.4 Update `world.rs` schedule: replace `move_towards_target + assign_random_target` with `(find_path_action, move_along_path).chain()`
- [x] 3.5 Remove unused `assign_random_target`, `random_target`, `move_towards_target` from `systems.rs`

## 4. Rust core: WASM API

- [x] 4.1 Implement `getTileMap()` on `GameWorld`: serialize tiles as JSON with `cols`, `rows`, `tiles[]` (strings of 'G'/'B')
- [x] 4.2 Update unit spawn in `createGameWorld` to use `Path` instead of `Target`

## 5. Frontend: Tile map rendering

- [x] 5.1 Call `getTileMap()` after `createGameWorld()` in `UnitsCanvas.tsx`
- [x] 5.2 Render tile grid on canvas: walkable tiles in light green, blocked tiles in dark color
- [x] 5.3 Draw units on top of tile layer
- [x] 5.4 Update canvas field dimensions to 800×608

## 6. Verify and test

- [x] 6.1 Build WASM: `wasm-pack build crates/core` succeeds
- [x] 6.2 Run frontend dev server: `npm run dev` loads without errors
- [x] 6.3 Visual check: tile map renders, units navigate around blocked tiles
