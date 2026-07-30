## ADDED Requirements

### Requirement: Pixi Application lifecycle
The system SHALL provide a `SceneRenderer` class that wraps a PixiJS `Application` and manages its full lifecycle (init, attach to DOM, destroy).

#### Scenario: Renderer initializes Pixi Application
- **WHEN** `SceneRenderer.init(parent)` is awaited
- **THEN** a `PIXI.Application` SHALL be created with WebGL/WebGPU auto-selected
- **THEN** the canvas size SHALL be 800×608 CSS pixels (25 cols × 19 rows × 32 px)
- **THEN** the internal resolution SHALL match `window.devicePixelRatio` with `autoDensity: true`
- **THEN** `antialias` SHALL be `false` and `roundPixels` SHALL be `true`
- **THEN** the canvas SHALL be appended to the provided parent element
- **THEN** `image-rendering: pixelated` SHALL be applied to the canvas style

#### Scenario: Renderer destroys cleanly
- **WHEN** `SceneRenderer.destroy()` is called
- **THEN** the `PIXI.Application` SHALL be destroyed with children and textures
- **THEN** subsequent calls to `destroy()` SHALL be no-ops

### Requirement: Scene layer structure
The system SHALL organize the scene as four ordered containers: `terrain`, `decals`, `units`, `overlay`.

#### Scenario: Layers exist and render in order
- **WHEN** a `SceneRenderer` is constructed
- **THEN** it SHALL expose `layers.terrain`, `layers.decals`, `layers.units`, `layers.overlay` as `PIXI.Container` instances
- **THEN** the stage child order SHALL be terrain → decals → units → overlay (back to front)
- **THEN** `layers.units.sortableChildren` SHALL be `true`

### Requirement: Render loop drives game tick
The system SHALL drive the WASM game tick and per-frame sprite updates from `app.ticker`.

#### Scenario: Ticker advances simulation and rendering
- **WHEN** a frame is processed by the ticker
- **THEN** the WASM `world.tick(deltaMs)` SHALL be called with `ticker.deltaMS`
- **THEN** unit positions SHALL be read from WASM and applied to `UnitSprite` instances
- **THEN** the `units` container SHALL be re-sorted by `zIndex`

### Requirement: React integration
The system SHALL allow a React component to mount and unmount a Pixi scene without leaks.

#### Scenario: Component mounts and unmounts
- **WHEN** `UnitsCanvas` mounts with a `seed`
- **THEN** it SHALL create a `SceneRenderer`, await `init`, then create the WASM world and add terrain and unit sprites
- **WHEN** the component unmounts or `seed` changes
- **THEN** the renderer SHALL be destroyed, the WASM world SHALL be freed, and the container SHALL contain no child canvas
