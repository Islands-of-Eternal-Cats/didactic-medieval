# Tile Map Rendering

## MODIFIED Requirements

### Requirement: Tile map caching
The system SHALL pre-render all tile textures into a cache at initialization.

#### Scenario: Tile map cache built from map data
- **WHEN** a tile map renderer is constructed with a TileMapData and seed
- **THEN** it SHALL build a 2D cache array matching map dimensions
- **THEN** each cache entry SHALL reference a tile canvas from the Tiny Town spritesheet
- **THEN** walkable tiles (`G`) SHALL use a random grass variant from the Kenney tileset
- **THEN** non-walkable tiles (`B`) SHALL use water (index 48) or stone (index 96), chosen randomly per tile

### Requirement: Frame rendering
The system SHALL render a complete frame by compositing cached tile textures and unit sprites.

#### Scenario: Frame renders all layers
- **WHEN** render is called with a CanvasRenderingContext2D
- **THEN** it SHALL draw each tile from the cache at position (col * TILE_SIZE, row * TILE_SIZE) where TILE_SIZE is 16
- **THEN** unit sprites SHALL be drawn on top of all tiles
- **THEN** unit sprites SHALL have a vertical bob animation using sin(time * 2 + unitId) * 0.5

### Requirement: DPR-aware canvas setup
The system SHALL configure the canvas for high-DPI displays with nearest-neighbor scaling and CSS 2× integer scale for pixel-art rendering.

#### Scenario: Canvas initialized with DPR and CSS scale
- **WHEN** the canvas is set up
- **THEN** canvas pixel width SHALL be 400 * devicePixelRatio
- **THEN** canvas pixel height SHALL be 304 * devicePixelRatio
- **THEN** canvas CSS width SHALL be 800px
- **THEN** canvas CSS height SHALL be 608px
- **THEN** the 2D context transform SHALL be scaled by devicePixelRatio
- **THEN** imageSmoothingEnabled SHALL be set to false

#### Scenario: Unit positions converted from tile-units to pixels
- **WHEN** a unit position is received from WASM
- **THEN** the x-coordinate SHALL be multiplied by TILE_SIZE (16) before drawing
- **THEN** the y-coordinate SHALL be multiplied by TILE_SIZE (16) before drawing
- **THEN** the sprite SHALL be drawn centered on the pixel position: drawImage(sprite, pixelX - 8, pixelY - 16)
