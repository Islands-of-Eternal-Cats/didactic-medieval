# Pixel Art Tiles

## Purpose

Generate procedural pixel-art tile textures for the game map grid, including terrain variants with decorations and animated effects. TBD: integrate tile palette with map rendering pipeline.

## Requirements

### Requirement: Grass tile generation
The system SHALL generate 32×32 pixel-art grass tiles with procedural noise and optional decorations.

#### Scenario: Grass tile has random noise pixels
- **WHEN** a grass tile is generated
- **THEN** it SHALL contain a base fill color from the GRASS_BASE palette
- **THEN** it SHALL contain approximately 60 randomly placed noise pixels in dark/light green
- **THEN** it SHALL have a dark border on top and left edges

#### Scenario: Grass tile may have bush decoration
- **WHEN** a grass tile is generated with seed producing a bush decoration (20% chance)
- **THEN** it SHALL include a circular cluster of dark green pixels centered within the tile
- **THEN** it SHALL include a few randomly placed light green highlight pixels

#### Scenario: Grass tile may have flower decoration
- **WHEN** a grass tile is generated with seed producing a flower decoration
- **THEN** it SHALL include a 5-pixel cross-pattern flower in the configured color
- **THEN** it SHALL include a yellow center pixel at the flower center

### Requirement: Rock tile generation
The system SHALL generate 32×32 pixel-art rock tiles with crack details.

#### Scenario: Rock tile has noise and cracks
- **WHEN** a rock tile is generated
- **THEN** it SHALL have a dark gray base fill
- **THEN** it SHALL have approximately 40 noise pixels in lighter/darker gray shades
- **THEN** it SHALL have 3 crack lines in darker gray (3-7 pixels long, randomly horizontal or vertical)
- **THEN** it SHALL have a dark border on top and left edges

### Requirement: Water tile generation
The system SHALL generate 32×32 pixel-art water tiles with animated overlay.

#### Scenario: Water tile has base texture
- **WHEN** a water tile base is generated
- **THEN** it SHALL have a dark blue base fill
- **THEN** it SHALL have horizontal stripe lines every 4 rows in medium blue

#### Scenario: Water tile has animated highlight
- **WHEN** water tile is rendered with a time value
- **THEN** it SHALL draw two animated highlight pixels that move across the tile over time
