## ADDED Requirements

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
