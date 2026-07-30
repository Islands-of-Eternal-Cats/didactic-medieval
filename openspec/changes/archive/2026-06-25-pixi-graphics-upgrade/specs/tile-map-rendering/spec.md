## MODIFIED Requirements

### Requirement: Tile map caching
The system SHALL pre-build all tile sprites into a static `PIXI.Container` at initialization using textures shared from a single `TextureSource`.

#### Scenario: Tile map cache built from map data
- **WHEN** terrain is built with a `TileMapData` and seed
- **THEN** one `PIXI.Sprite` per cell SHALL be added to a terrain `Container`
- **THEN** each sprite SHALL reference a tile texture from the Kenney `tilemap.png` (12×11, 16 px, 1 px padding)
- **THEN** walkable tiles (`G`) SHALL use a random grass variant chosen by a seeded RNG
- **THEN** non-walkable tiles (`B`) SHALL use a tile selected by 4-neighbor autotiling (see `tile-autotiling` capability), falling back to plain water (48) or stone (109) when no transition exists

### Requirement: Frame rendering
The system SHALL render frames via PixiJS, with terrain static and units updated each tick.

#### Scenario: Frame renders all layers
- **WHEN** the Pixi ticker fires
- **THEN** the terrain `Container` SHALL be drawn unchanged from the previous frame
- **THEN** shadows SHALL be drawn in `layers.decals` under each unit
- **THEN** unit sprites SHALL be drawn in `layers.units` sorted by `zIndex = y`
- **THEN** each unit sprite SHALL have a vertical bob animation using `sin((phase / 200) + unitId) * 1` px
- **THEN** the shadow SHALL NOT bob with the unit

### Requirement: DPR-aware canvas setup
The system SHALL configure the Pixi canvas for high-DPI displays with nearest-neighbor scaling for pixel-art rendering.

#### Scenario: Canvas initialized with DPR and CSS size
- **WHEN** the Pixi `Application` is initialized
- **THEN** the canvas CSS width SHALL be 800 px and CSS height SHALL be 608 px
- **THEN** the internal resolution SHALL be `window.devicePixelRatio` with `autoDensity: true`
- **THEN** `antialias` SHALL be `false`
- **THEN** all tile and unit textures SHALL use `scaleMode: 'nearest'`
- **THEN** the canvas style SHALL include `image-rendering: pixelated`

#### Scenario: Unit positions converted from tile-units to pixels
- **WHEN** a unit position is received from WASM
- **THEN** the x-coordinate SHALL be multiplied by 32 (RENDER_TILE_SIZE) before drawing
- **THEN** the y-coordinate SHALL be multiplied by 32 (RENDER_TILE_SIZE) before drawing
- **THEN** the sprite anchor SHALL place the unit's feet on the resulting pixel position
