## ADDED Requirements

### Requirement: Player can enter build mode
The frontend SHALL provide a toolbar with buttons for three building types: Wall, Bed, Campfire.

#### Scenario: Select build mode
- **WHEN** player clicks the "Стена" button
- **THEN** build mode is activated for walls; the button is highlighted

#### Scenario: Deselect build mode
- **WHEN** player clicks the active build mode button or presses Escape
- **THEN** build mode is deactivated

#### Scenario: Build mode cycling
- **WHEN** build mode is active and player clicks a different building button
- **THEN** build mode switches to the new building type

### Requirement: Player can place buildings on the map
When build mode is active and the player clicks a valid tile on the game map, the system SHALL send a `BuildRequest` with the tile coordinates and building type.

#### Scenario: Place building on valid tile
- **WHEN** player clicks a walkable empty tile while in build mode
- **THEN** a `BuildRequest` is sent; the building appears on that tile

#### Scenario: Place building on occupied tile
- **WHEN** player clicks a tile that already has a building
- **THEN** the build request is ignored

#### Scenario: Place building on blocked tile
- **WHEN** player clicks a blocked (non-walkable) tile
- **THEN** the build request is ignored

#### Scenario: Place wall on walkable tile
- **WHEN** player builds a wall on a walkable tile
- **THEN** the tile becomes blocked in `TileMapResource`; A* paths are recalculated

#### Scenario: Place wall on already blocked tile
- **WHEN** player tries to build a wall on a blocked tile
- **THEN** the build request is ignored

### Requirement: Buildings are rendered on the map
The frontend SHALL render all placed buildings as visual sprites on a dedicated buildings layer.

#### Scenario: Wall is rendered as gray rectangle
- **WHEN** a wall is placed on the map
- **THEN** a gray 32×32 rectangle appears at that tile position

#### Scenario: Bed is rendered as brown shape
- **WHEN** a bed is placed on the map
- **THEN** a brown procedural sprite appears at that tile position

#### Scenario: Campfire is rendered with animation
- **WHEN** a campfire is placed on the map
- **THEN** a procedural fire sprite with 2-frame animation appears at that tile position

#### Scenario: Building sprites persist across ticks
- **WHEN** the simulation ticks
- **THEN** building sprites remain in sync with `getMapObjects()` data

### Requirement: WASM API exposes building methods
The WASM bridge SHALL expose `build(col, row, kind)`, `getMapObjects()`, and `getUnitStates()` methods.

#### Scenario: Build method creates request
- **WHEN** `world.build(5, 10, "campfire")` is called from JS
- **THEN** ECS receives a `BuildRequest` for a campfire at col=5, row=10

#### Scenario: Get map objects returns JSON
- **WHEN** `world.getMapObjects()` is called
- **THEN** a JSON array of all placed objects is returned

#### Scenario: Get unit states returns JSON
- **WHEN** `world.getUnitStates()` is called
- **THEN** a JSON array with each colonist's satiation, energy, and debuff status is returned
