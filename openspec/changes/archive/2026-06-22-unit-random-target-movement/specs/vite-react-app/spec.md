## MODIFIED Requirements

### Requirement: Units canvas visualization

The application SHALL render units on an HTML `<canvas>` element with logical dimensions 800×600 pixels. Unit positions SHALL be obtained from the WASM `getUnitPositions()` method after creating a game world via `createGameWorld()`. Each unit SHALL be drawn as a visible marker (e.g. filled circle) at the corresponding `(x, y)` coordinates in canvas space. The canvas SHALL be continuously updated via a `requestAnimationFrame` loop that calls the WASM `tick(deltaMs)` method and redraws units at their updated positions.

#### Scenario: Units visible after WASM load

- **WHEN** the user opens the application root URL in a browser after WASM has loaded
- **THEN** the page displays a canvas with visible unit markers
- **THEN** the number of drawn markers matches the length of the parsed `getUnitPositions()` array

#### Scenario: Positions match WASM data

- **WHEN** units are rendered on the canvas
- **THEN** each marker is drawn at the `(x, y)` coordinates from the corresponding entry in `getUnitPositions()`

#### Scenario: Units animate over time

- **WHEN** the canvas is displayed and the animation loop is running
- **THEN** unit markers change position over time (visible movement on the canvas)
