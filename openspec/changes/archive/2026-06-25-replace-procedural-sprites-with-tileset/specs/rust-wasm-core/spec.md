# Rust WASM Core

## MODIFIED Requirements

### Requirement: ECS game world
The `crates/core` WASM module SHALL maintain a `bevy_ecs::World` containing unit entities. Each unit entity SHALL have a `Position` component with `x` and `y` fields as `f32` values in the range `[0, FIELD_WIDTH)` and `[0, FIELD_HEIGHT)` respectively, where `FIELD_WIDTH` is 25 (in tile units) and `FIELD_HEIGHT` is 19 (in tile units). Each spawned unit's position SHALL lie on a walkable tile of the world's `TileMapResource`.

#### Scenario: World contains spawned units
- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** the internal ECS world contains exactly `unitCount` entities with a `Position` component
- **THEN** each position has `0 <= x < 25` and `0 <= y < 19`

#### Scenario: Spawned units are on walkable tiles
- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** for each unit position, converting `(x, y)` to tile coordinates via `TileMapResource::world_to_tile` yields a tile where `is_walkable` is `true`

### Requirement: getUnitPositions API
The WASM module SHALL export a method `getUnitPositions` on the game world handle that returns a JSON string: an array of objects `{ "id": number, "x": number, "y": number }`, where `id` is the spawn index from `0` to `unitCount - 1`.

#### Scenario: JSON shape and coordinates
- **WHEN** a game world is created and `getUnitPositions()` is called
- **THEN** parsing the result yields an array of objects each with numeric `id`, `x`, and `y`
- **THEN** all `x` and `y` values are within the field bounds (0..25, 0..19)

#### Scenario: Positions are on walkable tiles
- **WHEN** a game world is created and `getUnitPositions()` is called
- **THEN** each unit's `(x, y)` maps to a walkable tile according to the world's `TileMapResource`

### Requirement: Target and Speed components
Each unit entity in the ECS world SHALL have a `Target` component with `x` and `y` fields (`f32`, within field bounds) and a `Speed` component (`f32`, in tile-units per second).

#### Scenario: Spawned units have target and speed
- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** each spawned unit entity has `Position`, `Target`, and `Speed` components
- **THEN** each `Speed` value is 3.75 tile-units/second

### Requirement: Movement system
The ECS world SHALL include a movement system that updates each unit's `Position` toward its `Target` at the rate defined by `Speed`, given a `delta_time` in seconds. Upon arrival, the movement system SHALL send a `TargetReached` message rather than directly reassigning the target.

#### Scenario: Position moves toward target
- **WHEN** a unit's `Position` is not at its `Target` and `tick(deltaMs)` is called with `deltaMs` greater than 0
- **THEN** the unit's `Position` moves closer to its `Target`
- **THEN** the distance between `Position` and `Target` decreases

#### Scenario: Unit arrives at target
- **WHEN** a unit's `Position` is within the arrival threshold (0.125 tile-units) of its `Target` during a `tick` call
- **THEN** the movement system sends a `TargetReached` message for that entity

### Requirement: TileMapResource coordinates
`TileMapResource` SHALL not store or expose a `TILE_SIZE` constant. Coordinate conversion methods SHALL operate in tile units:
- `world_to_tile(x, y)`: SHALL return `(x.floor() as u32, y.floor() as u32)`
- `tile_to_world(col, row)`: SHALL return `(col as f32 + 0.5, row as f32 + 0.5)`

#### Scenario: world_to_tile converts tile-units to grid
- **WHEN** `world_to_tile(5.3, 3.7)` is called
- **THEN** it returns `(5, 3)`

#### Scenario: tile_to_world returns tile center
- **WHEN** `tile_to_world(5, 3)` is called
- **THEN** it returns `(5.5, 3.5)`
