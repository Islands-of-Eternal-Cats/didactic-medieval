# Tile Map Rendering

## Purpose

Render the game field by compositing cached tile textures, decorations, animated water overlays, and unit sprites onto a DPR-aware canvas with nearest-neighbor scaling.

## Requirements

### Requirement: Tile map caching
The system SHALL pre-render all tile textures into a cache at initialization.

#### Scenario: Tile map cache built from map data
- **WHEN** a tile map renderer is constructed with a TileMapData and seed
- **THEN** it SHALL generate a 2D cache array matching map dimensions
- **THEN** grass tiles (walkable) SHALL use generated grass variants with decorations
- **THEN** non-walkable tiles SHALL use rock texture (60% chance) or water (40% chance)

### Requirement: Frame rendering
The system SHALL render a complete frame by compositing cached tile textures and animated unit sprites.

#### Scenario: Frame renders all layers
- **WHEN** render is called with a CanvasRenderingContext2D and time
- **THEN** it SHALL draw each tile from the cache at the correct position (col * TILE_SIZE, row * TILE_SIZE)
- **THEN** decoration canvases SHALL be drawn on top of their parent tile
- **THEN** water overlay highlights SHALL be drawn animated by time
- **THEN** unit sprites SHALL be drawn on top of all tiles
- **THEN** unit sprites SHALL have a vertical bob animation using sin(time * 2 + unitId)

### Requirement: DPR-aware canvas setup
The system SHALL configure the canvas for high-DPI displays with nearest-neighbor scaling.

#### Scenario: Canvas initialized with DPR
- **WHEN** the canvas is set up
- **THEN** canvas pixel dimensions SHALL be FIELD_WIDTH * devicePixelRatio
- **THEN** canvas CSS dimensions SHALL be FIELD_WIDTH x FIELD_HEIGHT
- **THEN** the 2D context transform SHALL be scaled by devicePixelRatio
- **THEN** imageSmoothingEnabled SHALL be set to false
