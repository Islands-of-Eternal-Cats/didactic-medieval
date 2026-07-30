## ADDED Requirements

### Requirement: Per-unit Pixi sprite
The system SHALL represent every game unit as a `PIXI.Sprite` whose texture is generated from the procedural knight art and cached.

#### Scenario: Sprite created per unit
- **WHEN** the scene is initialized for N units
- **THEN** N `UnitSprite` instances SHALL be created
- **THEN** each instance SHALL hold a `PIXI.Sprite` added to `layers.units`
- **THEN** the sprite SHALL be rendered at 32×32 px on screen (16×16 source upscaled ×2)
- **THEN** the sprite anchor SHALL place the unit's feet on the world Y coordinate

### Requirement: Y-sort by world Y
The system SHALL render units in correct depth order so that units lower on screen occlude units higher on screen.

#### Scenario: zIndex follows y
- **WHEN** unit positions are updated each frame
- **THEN** each `UnitSprite.zIndex` SHALL be set to its current screen `y`
- **THEN** the `units` container SHALL re-sort children before rendering

### Requirement: Shadow under unit
The system SHALL render a soft elliptical shadow under each unit to anchor it to the ground.

#### Scenario: Shadow follows unit feet
- **WHEN** a unit moves
- **THEN** an elliptical shadow (~20×6 px, black, alpha ≈ 0.35) SHALL be drawn in `layers.decals` at the unit's feet position
- **THEN** the shadow SHALL NOT bob with the unit sprite

### Requirement: Direction of movement
The system SHALL infer one of four facing directions (N, S, E, W) from the unit's velocity and render the corresponding sprite frame.

#### Scenario: Direction inferred from delta
- **WHEN** a unit moves between two frames with delta `(dx, dy)`
- **THEN** the dominant axis SHALL select the facing: `|dx| > |dy|` → E or W, else N or S
- **THEN** small deltas below a jitter threshold SHALL keep the previous facing
- **THEN** the displayed texture SHALL match the inferred direction

### Requirement: Asynchronous walk animation phase
The system SHALL animate each unit's walk cycle on its own phase so that units do not march in lockstep.

#### Scenario: Phase is per-unit
- **WHEN** a `UnitSprite` is created with id `i`
- **THEN** its animation phase SHALL be initialized to `(i * 73) % 900` ms
- **WHEN** the unit is moving
- **THEN** the phase SHALL advance by `deltaMs` each frame
- **THEN** the displayed frame SHALL be `floor(phase / 300) % 3`
- **WHEN** the unit is idle (delta below threshold)
- **THEN** frame 0 (idle pose) SHALL be displayed

### Requirement: Texture cache for direction × frame × color
The system SHALL cache generated knight textures keyed by `(color, direction, frame)` so that each unique key produces the texture only once.

#### Scenario: Cache reuse
- **WHEN** multiple units share the same color and request the same `(direction, frame)`
- **THEN** the same `PIXI.Texture` instance SHALL be returned from the cache
- **THEN** PixiJS batching SHALL render them in the minimum possible draw calls
