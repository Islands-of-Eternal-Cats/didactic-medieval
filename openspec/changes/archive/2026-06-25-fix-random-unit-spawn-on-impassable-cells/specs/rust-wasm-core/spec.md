## MODIFIED Requirements

### Requirement: ECS game world

The `crates/core` WASM module SHALL maintain a `bevy_ecs::World` containing unit entities. Each unit entity SHALL have a `Position` component with `x` and `y` fields as `f32` values in the range `[0, FIELD_WIDTH)` and `[0, FIELD_HEIGHT)` respectively, where `FIELD_WIDTH` is 800 and `FIELD_HEIGHT` is 608. Each spawned unit's position SHALL lie on a walkable tile of the world's `TileMapResource` (the tile containing the position has `is_walkable == true`).

#### Scenario: World contains spawned units

- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** the internal ECS world contains exactly `unitCount` entities with a `Position` component
- **THEN** each position has `0 <= x < 800` and `0 <= y < 608`

#### Scenario: Spawned units are on walkable tiles

- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** for each unit position, converting `(x, y)` to tile coordinates via `TileMapResource::world_to_tile` yields a tile where `is_walkable` is `true`

### Requirement: createGameWorld API

The WASM module SHALL export a function named `createGameWorld` that accepts `unitCount` (`u32`) and `seed` (`u64`), spawns `unitCount` units with pseudo-random positions derived from `seed` on walkable tiles of the generated tile map, and returns a handle to the game world.

#### Scenario: Deterministic spawn from seed

- **WHEN** `createGameWorld(50, 42)` is called twice in separate WASM sessions
- **THEN** both calls produce worlds whose `getUnitPositions()` JSON arrays are identical

#### Scenario: Unit count matches request

- **WHEN** `createGameWorld(50, seed)` is called
- **THEN** `getUnitPositions()` returns a JSON array of length 50

#### Scenario: Units spawn on walkable tiles only

- **WHEN** `createGameWorld(unitCount, seed)` is called
- **THEN** no unit's initial position maps to a blocked tile in `getTileMap()`

### Requirement: getUnitPositions API

The WASM module SHALL export a method `getUnitPositions` on the game world handle that returns a JSON string: an array of objects `{ "id": number, "x": number, "y": number }`, where `id` is the spawn index from `0` to `unitCount - 1`.

#### Scenario: JSON shape and coordinates

- **WHEN** a game world is created and `getUnitPositions()` is called
- **THEN** parsing the result yields an array of objects each with numeric `id`, `x`, and `y`
- **THEN** all `x` and `y` values are within the field bounds (0..800, 0..608)

#### Scenario: Positions are on walkable tiles

- **WHEN** a game world is created and `getUnitPositions()` is called
- **THEN** each unit's `(x, y)` maps to a walkable tile according to the world's `TileMapResource`
