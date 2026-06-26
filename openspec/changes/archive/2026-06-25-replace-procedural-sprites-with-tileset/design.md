## Context

The game renders a 25×19 tile map with procedurally generated pixel-art tiles and knight sprites. The current procedural generation produces noise-based textures that don't look like classic RPG tiles. To improve visual quality with minimal effort, we're replacing all tile textures with Kenney Tiny Town (CC0 spritesheet).

The Rust WASM core currently uses pixel coordinates internally, requiring TILE_SIZE to be shared between Rust and TypeScript. This creates unwanted coupling — changing resolution requires rebuilding WASM.

## Goals / Non-Goals

**Goals:**
- Replace procedural tile generation with Tiny Town 16×16 spritesheet (grass/water/stone)
- Remove TILE_SIZE from Rust — coordinate system operates in tile-units
- Maintain crisp pixel-art rendering via CSS 2× integer scaling
- Keep existing 16×16 knight sprites unchanged

**Non-Goals:**
- Not adding new terrain types beyond grass/water/stone
- Not implementing auto-tiling (terrain transitions)
- Not changing game mechanics or pathfinding behavior
- Not replacing knight sprites

## Decisions

### Decision 1: Tile-unit coordinates in Rust
Rust returns positions in tile-units (e.g., tile center at `(col + 0.5, row + 0.5)`). TypeScript multiplies by TILE_SIZE for rendering.

**Alternatives considered:**
- Keep pixel coordinates in Rust — requires updating TILE_SIZE in Rust when resolution changes, tighter coupling
- Pass TILE_SIZE from JS to Rust at init — adds complexity, still couples systems

**Rationale:** Pure coordinate abstraction. Rust concerns itself only with tile grid logic. Frontend owns all pixel-level decisions.

### Decision 2: CSS 2× scaling instead of larger tiles
Canvas renders at native 400×304 (25×19 × 16px) and displays at 800×608 CSS pixels with `imageSmoothingEnabled = false`.

**Alternatives considered:**
- Increase grid to 50×38 tiles — keeps 800×608 field but doubles tile count, more map data
- Use 32×32 tiles (Tiny Town doesn't exist at 32×32)
- Scale canvas content manually with ctx.scale(2, 2)

**Rationale:** Nearest-neighbor CSS scaling is free (no extra draw calls), pixel-perfect, and gives authentic retro look on both Retina and standard displays.

### Decision 3: Async spritesheet loading
The tilemap.png (5KB) is loaded via Vite asset import as an Image, decoded, and sliced into 132 individual tile canvases at init.

**Alternatives considered:**
- Inline base64 — increases bundle size permanently
- Individual tile PNGs — more HTTP requests, complex asset management
- Draw Image sub-rects each frame — simpler but slightly slower per frame

**Rationale:** Slicing once at init is a one-time cost. Cached canvases mean O(1) per-tile draw cost during rendering.

### Decision 4: Simple tile index mapping
Blocked tiles split 50/50 between water (spritesheet index 48) and stone (index 96). Walkable tiles pick randomly from 5 grass variants (indices 0, 1, 2, 4, 5).

**Rationale:** Minimal complexity for v1. Tile variety can be expanded iteratively.

## Risks / Trade-offs

- [Map too small] → CSS scaling means some users see a 400×304 logical area. Mitigation: this matches classic handheld RPGs (GBA was 240×160). Can increase grid later.
- [Spritesheet loading race] → If Image loads after first frame, canvas flashes blank. Mitigation: await image decode before constructing TileMapRenderer.
- [Broken tests from coordinate change] → Rust unit tests check pixel positions. Mitigation: update test assertions to tile-unit values.
