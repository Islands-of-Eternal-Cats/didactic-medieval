## ADDED Requirements

### Requirement: Units canvas visualization

The application SHALL render units on an HTML `<canvas>` element with logical dimensions 800×600 pixels. Unit positions SHALL be obtained from the WASM `getUnitPositions()` method after creating a game world via `createGameWorld()`. Each unit SHALL be drawn as a visible marker (e.g. filled circle) at the corresponding `(x, y)` coordinates in canvas space.

#### Scenario: Units visible after WASM load

- **WHEN** the user opens the application root URL in a browser after WASM has loaded
- **THEN** the page displays a canvas with visible unit markers
- **THEN** the number of drawn markers matches the length of the parsed `getUnitPositions()` array

#### Scenario: Positions match WASM data

- **WHEN** units are rendered on the canvas
- **THEN** each marker is drawn at the `(x, y)` coordinates from the corresponding entry in `getUnitPositions()`

### Requirement: Regenerate units control

The application SHALL provide a user-visible control (e.g. button labeled «Перегенерировать» or equivalent) that creates a new game world with a different seed, clears the canvas, and redraws all units at new positions.

#### Scenario: Regenerate changes layout

- **WHEN** the user activates the regenerate control
- **THEN** a new `createGameWorld` call is made with a new seed
- **THEN** the canvas is cleared and redrawn with units at new positions
- **THEN** at least one unit position differs from the previous render (probabilistic; acceptable if all positions change)

#### Scenario: Regenerate preserves unit count

- **WHEN** the user activates the regenerate control
- **THEN** the redrawn canvas shows the same number of units as before regeneration (default 50)
