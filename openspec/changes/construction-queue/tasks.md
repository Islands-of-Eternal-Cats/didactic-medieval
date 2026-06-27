## 1. Rust Core — Data Model

- [x] 1.1 Add `MapTileObject` enum with `Building(ObjectKind)` and `ConstructionSite(ObjectKind)` variants to resources.rs
- [x] 1.2 Change `MapObjects.tiles` type from `Vec<Option<ObjectKind>>` to `Vec<Option<MapTileObject>>`
- [x] 1.3 Add `ConstructionJob` struct and `ConstructionQueue` resource with jobs vec to resources.rs
- [x] 1.4 Add `AssignedJob` component with `target: (u32, u32)` to components.rs

## 2. Rust Core — Systems

- [x] 2.1 Rewrite `construction_system` to create `ConstructionSite` + `ConstructionJob` instead of finished building
- [x] 2.2 Add `job_assignment_system` — assigns free colonists (no NeedsPlan, no AssignedJob) to nearest ConstructionJob with capacity
- [x] 2.3 Add `construction_progress_system` — accumulates progress per tick, replaces finished ConstructionSite with Building
- [x] 2.4 Update `find_nearest_object` to only match `Building(kind)`, excluding construction sites

## 3. Rust Core — WASM Bridge

- [x] 3.1 Update `GameWorld::get_map_objects()` to include construction sites as `{kind: "ConstructionSite", underlying: "Wall"}`
- [x] 3.2 Add `GameWorld::get_construction_progress()` returning `[{col, row, progress, kind}]`
- [x] 3.3 Update `GameWorld::build()` to send BuildRequest to construction system (no change needed if event-based)
- [x] 3.4 Register new systems and messages in `create_game_world` schedule

## 4. Frontend — Rendering

- [x] 4.1 Add `ConstructionSite` type to BuildingRenderer types and render as semi-transparent building (alpha 0.5)
- [x] 4.2 Render progress bar above construction sites reflecting `progress / max_progress`
- [x] 4.3 Handle the transition: when construction completes, site sprite removed and finished building appears
- [x] 4.4 Fetch and pass construction progress data from WASM to renderer in game loop

## 5. Build & Verify

- [x] 5.1 `wasm-pack build` succeeds with no errors
- [x] 5.2 TypeScript compilation succeeds (tileMapRenderer.ts — предсуществующий мёртвый файл, не связан с изменениями)
- [ ] 5.3 Manual test: place building → construction site appears → colonist walks to it → building completes
