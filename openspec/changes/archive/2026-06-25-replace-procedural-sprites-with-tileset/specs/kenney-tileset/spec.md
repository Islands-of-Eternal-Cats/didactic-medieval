# Kenney Tileset

## Purpose

Load, slice, and cache the Kenney Tiny Town 16×16 spritesheet. Map game tile types (grass/water/stone) to spritesheet indices and provide typed access to individual tile canvases.

## Requirements

### Requirement: Spritesheet loading
The system SHALL load the Tiny Town `tilemap.png` sprite sheet from the assets directory at application startup.

#### Scenario: Spritesheet loads successfully
- **WHEN** the application initializes and requests the spritesheet
- **THEN** the Image SHALL decode successfully
- **THEN** the spritesheet dimensions SHALL be 203×186 pixels

#### Scenario: Spritesheet not found
- **WHEN** the spritesheet file fails to load or decode
- **THEN** the system SHALL throw an error that prevents TileMapRenderer construction

### Requirement: Tile slicing
The system SHALL slice the loaded spritesheet into 132 individual 16×16 tile canvases, with 1px padding between tiles in the spritesheet.

#### Scenario: Tiles sliced correctly
- **WHEN** tiles are sliced from the spritesheet
- **THEN** exactly 132 tile canvases SHALL be produced (12 columns × 11 rows)
- **THEN** each tile canvas SHALL be 16×16 pixels

### Requirement: Tile type mapping
The system SHALL map game tile types to spritesheet indices as follows:
- Grass (walkable): randomly chosen from {0, 1, 2, 25, 39, 40, 41, 42, 43}
- Water (blocked): index 48
- Stone (blocked): index 109

#### Scenario: Grass tile selection
- **WHEN** a walkable tile is requested
- **THEN** the returned tile canvas SHALL be one of the grass variants (0, 1, 2, 25, 39, 40, 41, 42, or 43)

#### Scenario: Water tile selection
- **WHEN** a blocked tile is assigned the water type
- **THEN** the returned tile canvas SHALL be index 48

#### Scenario: Stone tile selection
- **WHEN** a blocked tile is assigned the stone type
- **THEN** the returned tile canvas SHALL be index 109

### Requirement: Blocked tile type distribution
The system SHALL distribute blocked tiles randomly between water and stone types.

#### Scenario: Even distribution
- **WHEN** the tile map has blocked tiles
- **THEN** each blocked tile SHALL be independently selected as water (50% chance) or stone (50% chance) using a seeded random generator
