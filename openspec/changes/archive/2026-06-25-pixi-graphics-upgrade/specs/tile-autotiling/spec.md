## ADDED Requirements

### Requirement: 4-neighbor bitmask autotiling
The system SHALL select the visual tile for each non-grass cell based on the walkability of its 4 cardinal neighbors (N, E, S, W).

#### Scenario: Bitmask drives tile choice
- **WHEN** the terrain is built for a `TileMapData`
- **THEN** for each non-walkable cell, a 4-bit bitmask SHALL be computed: `(N walkable << 3) | (E walkable << 2) | (S walkable << 1) | (W walkable)`
- **THEN** the bitmask SHALL be used as the key into a lookup table that returns the source tile index in `tilemap.png`
- **THEN** two independent lookup tables SHALL exist: one for grass↔water borders and one for grass↔stone borders

#### Scenario: Fallback when no transition tile exists
- **WHEN** the lookup table has no entry for a given bitmask
- **THEN** the renderer SHALL fall back to the plain water (index 48) or stone (index 109) tile
- **THEN** no rendering error SHALL occur

### Requirement: Tile texture cache from spritesheet
The system SHALL load `tilemap.png` once and expose each tile as a `PIXI.Texture` sharing a single `TextureSource`.

#### Scenario: Tile textures created with nearest filtering
- **WHEN** `loadTileTextures()` is awaited
- **THEN** the spritesheet SHALL be loaded via `PIXI.Assets`
- **THEN** the source `scaleMode` SHALL be `'nearest'`
- **THEN** a `Texture` SHALL be created per tile (12 cols × 11 rows = 132 textures) using `Rectangle` frames with 1 px padding
- **THEN** all tile sprites SHALL share the same `TextureSource` so PixiJS can batch them

### Requirement: Terrain built once per seed
The system SHALL build the terrain container exactly once per `(map, seed)` pair and keep it static for the lifetime of the scene.

#### Scenario: Static terrain
- **WHEN** the scene is initialized
- **THEN** `buildTerrain(map, seed, tileTextures)` SHALL produce a `Container` with one `Sprite` per cell positioned on a 32 px grid
- **THEN** the terrain container SHALL NOT be rebuilt every frame
- **WHEN** the `seed` changes
- **THEN** the previous scene SHALL be destroyed and a new terrain SHALL be built

### Requirement: Decor on walkable tiles
The system SHALL place decorative objects (flowers / tufts) on a subset of walkable tiles using a seeded RNG.

#### Scenario: Decor is seeded
- **WHEN** terrain is built with a `seed`
- **THEN** walkable cells SHALL have a ~5% chance of receiving a decor sprite from the tileset
- **THEN** the RNG SHALL be derived deterministically from the same `seed` so that the same seed yields the same decor layout
- **THEN** decor sprites SHALL NOT block pathing or alter game state (they are visual only)
