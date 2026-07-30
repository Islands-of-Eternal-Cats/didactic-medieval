## ADDED Requirements

### Requirement: Tile map resource

The ECS world SHALL contain a `TileMapResource` with a grid of 25 columns × 19 rows, where each cell is either walkable (`true`) or blocked (`false`). Tile size SHALL be 32×32 pixels, producing a logical field of 800×608 pixels.

#### Scenario: Tile map dimensions

- **WHEN** `createGameWorld(unitCount, seed)` is called
- **THEN** the internal world contains a `TileMapResource` with `cols == 25` and `rows == 19`
- **THEN** `tile_size == 32`

#### Scenario: Tile map generated from seed

- **WHEN** `createGameWorld(unitCount, 42)` is called twice in separate WASM sessions
- **THEN** both produce identical `TileMapResource.tiles` arrays

#### Scenario: Tile map has ~12% blocked tiles

- **WHEN** a tile map is generated from any seed
- **THEN** the number of `false` entries in `tiles` is within 10–14% of total tiles (475), rounded to nearest integer

### Requirement: World-to-tile coordinate conversion

The `TileMapResource` SHALL provide methods to convert between world coordinates (`f32` pixels) and tile coordinates (`u32` column/row).

#### Scenario: World coordinates convert to tile

- **WHEN** converting world position (16, 16) to tile coordinates
- **THEN** the result is tile (0, 0)
- **WHEN** converting world position (800, 608) to tile coordinates
- **THEN** the result is tile (25, 19)

#### Scenario: Tile center converts to world coordinates

- **WHEN** converting tile (0, 0) to world position
- **THEN** the result is (16, 16) — the center of the first tile
- **WHEN** converting tile (24, 18) to world position
- **THEN** the result is (784, 592) — the center of the last tile

### Requirement: Field height change

The field height SHALL be 608 pixels (19 rows × 32 px) instead of the previous 600.

#### Scenario: Unit positions respect new bounds

- **WHEN** `createGameWorld(unitCount, seed)` is called
- **THEN** all spawned units have `0 <= x < 800` and `0 <= y < 608`

#### Scenario: Positions clamp to new height

- **WHEN** `tick(deltaMs)` moves a unit
- **THEN** `Position.y` is clamped to `[0, 608]`

### Requirement: getTileMap WASM API

The WASM module SHALL export a method `getTileMap` on the `GameWorld` handle that returns a JSON string with `cols`, `rows`, and `tiles` — an array of strings, each string of length `cols` where `'G'` = walkable and `'B'` = blocked.

#### Scenario: getTileMap returns valid JSON

- **WHEN** a game world is created and `getTileMap()` is called
- **THEN** parsing the result yields an object with `cols == 25`, `rows == 19`
- **THEN** `tiles` is an array of length 19
- **THEN** each string in `tiles` has length 25
- **THEN** each character is either `'G'` or `'B'`

### Requirement: Tile map canvas rendering

The application SHALL render the tile map on the units canvas. Walkable tiles SHALL be drawn in a light green color, blocked tiles in a dark color. Units SHALL be drawn on top of the tile layer.

#### Scenario: Tile map renders on canvas

- **WHEN** the application loads and creates a game world
- **THEN** the canvas displays a grid of colored tiles matching the `getTileMap()` data
- **THEN** blocked tiles are visually distinguishable from walkable tiles
- **THEN** unit markers are drawn on top of the tile grid

#### Scenario: Tile map persists across ticks

- **WHEN** `tick(deltaMs)` is called and units move
- **THEN** the tile map rendering remains unchanged
- **THEN** only unit positions update on the canvas
