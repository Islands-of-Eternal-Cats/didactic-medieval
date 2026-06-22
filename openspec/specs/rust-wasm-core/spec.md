# rust-wasm-core Specification

## Purpose

Rust/WASM-модуль `crates/core`: Cargo workspace, сборка в `pkg/`, API `getProgramName()` для связки TypeScript ↔ Rust.
## Requirements
### Requirement: Cargo workspace

The repository SHALL define a Cargo workspace at the repository root with `crates/core` as a workspace member.

#### Scenario: Workspace manifest exists

- **WHEN** a developer inspects the repository root
- **THEN** a `Cargo.toml` file exists with `[workspace]` listing `crates/core` as a member

### Requirement: WASM crate build

The `crates/core` crate SHALL compile to WebAssembly for the `wasm32-unknown-unknown` target and produce loadable artifacts in a `pkg/` directory at the repository root via `wasm-pack`.

#### Scenario: WASM build succeeds

- **WHEN** the user runs the project's WASM build script (`build:wasm` or equivalent documented in `package.json`)
- **THEN** the command completes with exit code 0
- **THEN** the `pkg/` directory contains JavaScript glue and a `.wasm` binary generated from `crates/core`

### Requirement: getProgramName API

The WASM module SHALL export a function named `getProgramName` that returns the string `Hello World` when invoked from JavaScript after WASM initialization.

#### Scenario: getProgramName returns greeting

- **WHEN** the WASM module is initialized and `getProgramName()` is called from JavaScript
- **THEN** the return value is the string `Hello World`

### Requirement: Workspace dependencies

The root `Cargo.toml` SHALL declare `wasm-bindgen` under `[workspace.dependencies]`, and `crates/core` SHALL reference it with `{ workspace = true }`.

#### Scenario: Shared dependency declaration

- **WHEN** a developer reads `crates/core/Cargo.toml`
- **THEN** `wasm-bindgen` is declared as a workspace dependency, not with a standalone version pin in the member crate alone

### Requirement: Dev watch for Rust sources

The project SHALL provide a development script that watches `crates/core` and rebuilds WASM on change using `cargo watch` and `wasm-pack`.

#### Scenario: Watch script documented

- **WHEN** a developer reads `package.json` scripts
- **THEN** a script exists (e.g. `dev:wasm`) that runs `cargo watch` to invoke `wasm-pack build` for `crates/core` on source changes

### Requirement: getCoreBuildInfo API

The WASM module SHALL export a function named `getCoreBuildInfo` that returns a JSON string with fields `layer` (`"core"`) and `version` (compact UTC datetime `YYYYMMDD.HHMMSS` of the last commit touching `crates/core/`, or `"unknown"`). Values SHALL be determined at WASM compile time via `build.rs` and embedded with `env!`.

#### Scenario: getCoreBuildInfo matches git

- **WHEN** the project is a git repository with at least one commit touching `crates/core/`
- **AND** WASM is rebuilt after the latest such commit
- **THEN** parsing `getCoreBuildInfo()` yields `version` equal to `TZ=UTC git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- crates/core/`

#### Scenario: getCoreBuildInfo fallback without git

- **WHEN** git is unavailable during WASM build or no commit history exists for `crates/core/`
- **THEN** `getCoreBuildInfo()` returns JSON with `version: "unknown"`

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

### Requirement: Target and Speed components

Each unit entity in the ECS world SHALL have a `Target` component with `x` and `y` fields (`f32`, within field bounds) and a `Speed` component (`f32`, pixels per second).

#### Scenario: Spawned units have target and speed

- **WHEN** `createGameWorld(unitCount, seed)` is called with `unitCount` greater than 0
- **THEN** each spawned unit entity has `Position`, `Target`, and `Speed` components
- **THEN** each `Target` has `0 <= x < 800` and `0 <= y < 600`
- **THEN** each `Speed` value is greater than 0

### Requirement: Movement system

The ECS world SHALL include a movement system that updates each unit's `Position` toward its `Target` at the rate defined by `Speed`, given a `delta_time` in seconds.

#### Scenario: Position moves toward target

- **WHEN** a unit's `Position` is not at its `Target` and `tick(deltaMs)` is called with `deltaMs` greater than 0
- **THEN** the unit's `Position` moves closer to its `Target`
- **THEN** the distance between `Position` and `Target` decreases (or the target is reassigned upon arrival)

#### Scenario: Unit arrives at target

- **WHEN** a unit's `Position` is within the arrival threshold of its `Target` during a `tick` call
- **THEN** the unit is assigned a new random `Target` within field bounds

### Requirement: tick API

The WASM module SHALL export a method `tick` on the game world handle that accepts `deltaMs` (`f32`, milliseconds) and advances the simulation by one step, running the movement system.

#### Scenario: tick advances simulation

- **WHEN** a game world is created and `tick(16.0)` is called
- **THEN** unit positions returned by `getUnitPositions()` differ from positions before the tick (unless all units are already at their targets and new targets coincide — acceptable edge case)

#### Scenario: Deterministic tick sequence

- **WHEN** two game worlds are created with `createGameWorld(50, 42)` and receive the same sequence of `tick(deltaMs)` calls
- **THEN** `getUnitPositions()` returns identical JSON after each tick in both worlds

