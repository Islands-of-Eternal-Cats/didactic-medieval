## Context

The current game renders flat-colored rectangles for tiles and units. The Rust ECS (`crates/core`) produces tile grid data and unit positions via WASM. The frontend (`src/UnitsCanvas.tsx`) consumes this data and renders using basic `ctx.fillRect` calls. This design adds procedural pixel-art generation in TypeScript, keeping the Rust layer unchanged.

## Goals / Non-Goals

**Goals:**
- Generate pixel-art grass tiles (with bushes/flowers) with seeded randomness
- Generate pixel-art rock tiles
- Generate animated water tiles
- Generate pixel-art knight sprites with walking animation
- Pre-render tile map into a cache at initialization
- Composite tile layers + unit sprites each frame
- Maintain DPR-aware canvas setup with `imageSmoothingEnabled = false`

**Non-Goals:**
- No changes to Rust ECS or WASM compilation
- No new external dependencies
- No unit path smoothing or pathfinding changes
- No UI additions beyond the visual upgrade

## Decisions

1. **Procedural generation over sprite sheets** — All pixel art is generated via Canvas 2D API at runtime. Avoids external asset files, simplifies deployment, and allows deterministic generation from seed.
2. **Per-tile pre-rendering** — Tile textures (grass, rock, water base) are generated once at init and cached. Only water overlay highlights animate per frame. Avoids regenerating static content each frame.
3. **Unit sprite caching per color+frame** — Knight sprites are generated once per (color, frame) combination and cached in a `Map<string, HTMLCanvasElement>`. Frame animation cycles through 3 walking frames via `requestAnimationFrame`.
4. **Seeded RNG** — Consistent deterministic output across seeds. Uses linear congruential generator (`seed + col * 7 + row * 31` for unique per-tile seeds).
5. **Canvas 2D API over OffscreenCanvas** — While the plan mentions OffscreenCanvas, the current implementation uses regular canvases for simplicity and broad compatibility. Can be migrated to OffscreenCanvas if worker-based rendering is needed.

## Risks / Trade-offs

- **Performance risk** → Canvas 2D rendering with many unit sprites may drop frames. Mitigation: each tile is pre-rendered, unit sprites are cached, and no allocations happen per frame.
- **Visual fidelity** → Procedural 32×32 pixel art may not match hand-crafted sprite quality. Mitigation: focus on charm and character through seeded variety and small details (bushes, flowers, bob animation).
- **Water animation** → Current implementation uses simple moving highlight dots. Mitigation: sufficient for conveying animation; can be enhanced later with wave patterns.
