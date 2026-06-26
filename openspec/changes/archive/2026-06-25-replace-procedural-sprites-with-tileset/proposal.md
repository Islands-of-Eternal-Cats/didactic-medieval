## Why

Current procedural tile generation produces low-quality noise textures that don't resemble classic RPG pixel art. Switching to a professionally-made CC0 tileset (Kenney Tiny Town) gives the game an authentic old-school RPG look with minimal effort.

## What Changes

- **Replace** procedural grass/rock/water tile generation with Kenney Tiny Town 16×16 spritesheet
- **Remove** `TILE_SIZE` from Rust WASM core — Rust operates in tile-unit coordinates, pixel conversion lives only on frontend
- **Change** field dimensions — canvas renders at 400×304 (25×19 tiles × 16px) with CSS 2× scaling for crisp pixel-art look
- **Keep** existing procedural 16×16 knight sprites (already 16×16, compatible with Tiny Town)

### BREAKING
- `TILE_SIZE` constant removed from Rust — coordinate system changes from pixels to tile-units
- `FIELD_WIDTH`/`FIELD_HEIGHT` change from 800/608 to 25.0/19.0 (tile units)
- Movement speed changes from 60 px/s to 3.75 tiles/s
- Tile rendering API changes — procedurally generated canvases replaced by spritesheet sub-rects

## Capabilities

### New Capabilities
- `kenney-tileset`: Load, slice, and cache the Tiny Town 16×16 spritesheet. Map tile types (grass/water/stone) to spritesheet indices.

### Modified Capabilities
- `pixel-art-tiles`: Entire spec replaced — procedural generation removed in favor of spritesheet tiles. All requirements are replaced.
- `tile-map-rendering`: Adapted for 16×16 spritesheet rendering with CSS 2× scaling. Tile positioning, water animation, and cache structure change.
- `rust-wasm-core`: TILE_SIZE removed from `TileMapResource`. `world_to_tile`/`tile_to_world` operate in tile units. `FIELD_WIDTH/FIELD_HEIGHT` change.
- `pixel-art-units`: **No changes** — knights remain procedural 16×16

## Impact

**Frontend:** `src/pixelSprites.ts` (major rewrite), `src/tileMapRenderer.ts` (major rewrite), `src/UnitsCanvas.tsx` (coordinate conversion, CSS scaling), `src/assets/tilemap.png` (new file)

**Rust WASM:** `crates/core/src/resources.rs` (TILE_SIZE removed), `crates/core/src/world.rs` (FIELD constants), `crates/core/src/systems.rs` (speed/threshold)

**Dependencies:** No new npm/cargo dependencies. Tiny Town is CC0 — no attribution required in code (file downloaded as binary asset).

**Build:** WASM must be rebuilt (`npm run build:wasm`). sprite sheet included as static asset in Vite.
