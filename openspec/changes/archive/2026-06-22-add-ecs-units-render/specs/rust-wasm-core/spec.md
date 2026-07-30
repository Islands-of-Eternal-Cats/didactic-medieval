## ADDED Requirements

### Requirement: ECS game world

The `crates/core` WASM module SHALL maintain a `bevy_ecs::World` containing unit entities. Each unit entity SHALL have a `Position` component with `x` and `y` fields as `f32` values in the range `[0, FIELD_WIDTH)` and `[0, FIELD_HEIGHT)` respectively, where `FIELD_WIDTH` is 800 and `FIELD_HEIGHT` is 600.

#### Scenario: World contains spawned units

- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** the internal ECS world contains exactly `unitCount` entities with a `Position` component
- **THEN** each position has `0 <= x < 800` and `0 <= y < 600`

### Requirement: createGameWorld API

The WASM module SHALL export a function named `createGameWorld` that accepts `unitCount` (`u32`) and `seed` (`u64`), spawns `unitCount` units with pseudo-random positions derived from `seed`, and returns a handle to the game world.

#### Scenario: Deterministic spawn from seed

- **WHEN** `createGameWorld(50, 42)` is called twice in separate WASM sessions
- **THEN** both calls produce worlds whose `getUnitPositions()` JSON arrays are identical

#### Scenario: Unit count matches request

- **WHEN** `createGameWorld(50, seed)` is called
- **THEN** `getUnitPositions()` returns a JSON array of length 50

### Requirement: getUnitPositions API

The WASM module SHALL export a method `getUnitPositions` on the game world handle that returns a JSON string: an array of objects `{ "id": number, "x": number, "y": number }`, where `id` is the spawn index from `0` to `unitCount - 1`.

#### Scenario: JSON shape and coordinates

- **WHEN** a game world is created and `getUnitPositions()` is called
- **THEN** parsing the result yields an array of objects each with numeric `id`, `x`, and `y`
- **THEN** all `x` and `y` values are within the field bounds (0..800, 0..600)

### Requirement: ECS workspace dependencies

The root `Cargo.toml` SHALL declare `bevy_ecs` and `rand` under `[workspace.dependencies]`, and `crates/core` SHALL reference them with `{ workspace = true }`.

#### Scenario: Shared dependency declaration

- **WHEN** a developer reads `crates/core/Cargo.toml`
- **THEN** `bevy_ecs` and `rand` are declared as workspace dependencies, not with standalone version pins in the member crate alone
