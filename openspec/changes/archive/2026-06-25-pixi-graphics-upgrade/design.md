## Context

Current renderer in `src/UnitsCanvas.tsx` uses Canvas 2D: a manual `requestAnimationFrame` loop draws 25×19 cached tile canvases and 50 procedural knight sprites via `ctx.drawImage` every frame. The setup works but is limited:

- No Y-sort — units overlap in spawn-order, not by depth.
- No shadows — units appear to float.
- No facing direction — all knights look at the viewer.
- All knights animate in lockstep against a global `elapsed` clock.
- Tilemap edges between grass and water/stone are square; the Kenney tileset has 132 tiles but only 3 are used.
- CPU-bound; little headroom to scale beyond ~100 units with extra effects.

Game core (`crates/core/**`, Rust + bevy_ecs compiled to WASM) is untouched: it owns positions, A* pathfinding, and the 25×19 tilemap. Frontend communicates with the core via `createGameWorld`, `world.tick(deltaMs)`, `world.getTileMap()`, `world.getUnitPositions()`.

Stakeholders: solo developer; goal is visual readability and scalability runway.

## Goals / Non-Goals

**Goals:**
- Replace the Canvas 2D renderer with a WebGL renderer (PixiJS v8) without changing the WASM-frontend contract.
- Increase rendered tile size from 16 px to 32 px (scene 800×608) for readability on modern displays.
- Make depth, motion, and terrain transitions visually clear (Y-sort, shadows, facings, autotiling, decor).
- Keep procedural pixel-art sprites (improve them in place, no external asset packs).
- Keep the architecture incremental: 8 ordered stages, each independently verifiable in the browser via `chrome-devtools` MCP.

**Non-Goals:**
- No changes to the Rust/WASM core (positions, pathfinding, tilemap generation).
- No combat, HP bars, or new gameplay systems.
- No day/night cycle, particles, or post-processing effects (deferred).
- No automated visual regression tests in this change; verification is manual via screenshots and DOM/WebGL probes.
- No replacement of the Kenney tilemap with another asset pack.

## Decisions

### Decision 1: PixiJS v8 over raw WebGL, Three.js, or staying on Canvas 2D
**Choice**: PixiJS v8 (WebGL2, falls back to WebGL1).
**Rationale**: Pixi is the standard 2D WebGL framework; it gives sprite batching, texture atlases, scene graph, and a ticker out of the box. v8 has native `roundPixels`, `nearest` scaling per `TextureSource`, and good TypeScript types. Three.js is overkill (3D-first). Raw WebGL would multiply work without payoff at this scale.
**Alternatives considered**:
- Stay on Canvas 2D + manual optimizations (offscreen canvases, dirty rects): unlocks fewer effects, hits CPU ceiling sooner.
- PixiJS v7: older API, no benefit over v8.
- Two.js / Konva: smaller communities, weaker batching.

### Decision 2: Render tile size = 32 px (logical tile remains 16 in WASM)
**Choice**: Frontend renders at 32 px per tile; WASM core keeps its 16 unit-grid coordinates unchanged.
**Rationale**: Doubling the render size improves readability and lets us draw richer sprites and shadows. Logical coords stay decoupled from rendering: a single constant `RENDER_TILE_SIZE = 32` in `src/render/SceneRenderer.ts` converts WASM positions to pixels.
**Alternatives considered**:
- Keep 16 px and use CSS scale: hurts shadow/decor fidelity, harder to position fractional pixels.
- Render at 48 px: scene would be 1200×912; too large in default layout, no extra clarity for a 25×19 board.

### Decision 3: Scene graph with 4 fixed layers (terrain / decals / units / overlay)
**Choice**: Fixed `Container` per layer, set up once in `SceneRenderer` constructor.
**Rationale**: Predictable z-order without `zIndex` on the top-level. Only `units` needs `sortableChildren = true` (Y-sort). Terrain stays static (built once per seed), decals (shadows) are simple `Graphics`, overlay reserved for future debug/vignette without churn.
**Alternatives considered**:
- Single container with global `sortableChildren`: every sprite would need a `zIndex`; risk of mis-sorting decor under terrain.
- Per-frame rebuild of terrain: wasteful — 475 sprites recreated needlessly.

### Decision 4: Shared `TextureSource` for tiles, per-key `Texture` cache for units
**Choice**: Load `tilemap.png` once, slice into 132 `Texture` instances pointing at the same `TextureSource`. Generate knight textures lazily on first request, keyed by `(color, direction, frame)`, also from shared offscreen canvases when possible.
**Rationale**: PixiJS batches sprites that share a `TextureSource`. With one tilesheet source + one (or a few) knight sources, the whole scene resolves in 1–3 draw calls.
**Alternatives considered**:
- Per-tile `Sprite` with own texture: breaks batching.
- Pre-generate all 4 dirs × 3 frames × 6 colors = 72 textures upfront: works but adds startup cost; lazy is simpler and adequate.

### Decision 5: Y-sort each frame, zIndex = sprite.y (integer)
**Choice**: In the ticker, set `unitSprite.zIndex = Math.round(unitSprite.y)` for every unit; `sortChildren()` runs automatically because `sortableChildren = true`.
**Rationale**: With 50–500 units, per-frame sort is cheap (`O(n log n)` ≈ 4500 ops at n=500). Integer `zIndex` avoids jitter from sub-pixel motion. Anchor at feet so Y position equals foot height — correct occlusion semantics.

### Decision 6: Direction inference from position delta (4-way)
**Choice**: `UnitSprite.update(pos, deltaMs)` computes `(dx, dy)` since last frame. If `max(|dx|, |dy|) < JITTER (≈ 0.02 px)`, keep prior facing. Otherwise dominant axis chooses N/S/E/W.
**Rationale**: WASM doesn't expose velocity; deriving it on the frontend is one subtraction per unit per frame. Jitter threshold prevents flicker on path-corner micro-stalls. 4-way is enough for readability and keeps the procedural sprite work tractable (W = mirror of E).
**Alternatives considered**:
- 8-way: doubles sprite variants; small readability gain on a square grid.
- Push velocity out of WASM: changes the core API; out of scope.

### Decision 7: Per-unit animation phase with seeded offset
**Choice**: `phase` is owned by `UnitSprite`. Initialized to `(id * 73) % 900` ms; advances by `deltaMs` only while moving. Displayed frame = `floor(phase / 300) % 3`. When idle, frame = 0.
**Rationale**: Breaks the "marching parade" look. `73` and `900` are coprime-ish picks that distribute phases. Stopping the clock when idle means stationary units don't flicker.

### Decision 8: Autotiling via 4-neighbor bitmask + lookup table (tile index table built from `tilemap.png` analysis)
**Choice**: For each non-walkable cell, compute `mask = (N<<3)|(E<<2)|(S<<1)|W` where each bit is "neighbor is grass". Look up the source tile index in a table per border type (water, stone). Build the lookup tables in Stage 7a by reading `tilemap.png` pixels via `chrome-devtools_evaluate_script` (canvas-based `getImageData` on the public `vite` dev URL), classifying each of the 132 tiles by color signature in corners.
**Rationale**: 4-neighbor bitmask (16 keys) is the standard minimal autotile scheme; fits most tilesets including Kenney Tiny Town. Empirical classification avoids guessing tile indices.
**Alternatives considered**:
- 8-neighbor (Wang) tiles: 47 unique combinations, far more lookup entries; tileset must include corner variants that Tiny Town may not have completely.
- Hand-pick indices from the PNG visually: doable but slow and error-prone; the scripted approach is reproducible.

### Decision 9: React owns the lifecycle, Pixi owns the render
**Choice**: `UnitsCanvas` uses one `useEffect([seed])`. On mount: `new SceneRenderer()` → `await init(parent)` → load tile textures → spawn WASM world → build terrain → create `UnitSprite` per unit → start ticker. On unmount or seed change: `scene.destroy()` (which removes the canvas and frees GPU resources) + `world.free()` + manually empty parent as defence in depth.
**Rationale**: Idiomatic React integration; no global state. `seed` change is treated as a full scene rebuild, matching the WASM world rebuild today. Avoids React re-rendering Pixi internals.

### Decision 10: Verification through `chrome-devtools` MCP, not unit tests
**Choice**: After each stage, run `npm run build`, hit `npm run dev`, navigate the browser, then probe DOM/canvas/WebGL via `evaluate_script` (size, context, sampled pixels) and take screenshots into `/var/folders/.../opencode/`.
**Rationale**: Visual rendering is hard to assert in unit tests; MCP gives a fast feedback loop. Headless WebGL in Vitest/Jest is unreliable.
**Trade-off**: No regression coverage. Acceptable for this scoped visual change; a future change can introduce Playwright snapshot tests.

## Risks / Trade-offs

- **Bundle size grows (~+650 KB raw, ~+160 KB gzip)** → Acceptable for a desktop dev/demo app; mitigated by Vite code-splitting Pixi sub-modules (`WebGLRenderer`, `WebGPURenderer`, `CanvasRenderer` are split chunks already).
- **WebGL2 requirement** → Mitigation: Pixi falls back to WebGL1 automatically; we don't use WebGL2-only features. Edge case: corporate browsers with hardware acceleration disabled fall back to slow software rendering. Out of scope.
- **`Texture.from(canvas)` upload cost** → Mitigation: generate each knight variant exactly once via lazy cache; never per frame.
- **Y-sort instability when two units share `y`** → Mitigation: round `zIndex` to int; stable sort is guaranteed by Pixi internally for ties.
- **Autotile table requires `tilemap.png` analysis** → Mitigation: Stage 7a uses scripted classification; falls back to plain water/stone tiles when no transition matches the bitmask. Scene degrades gracefully, never errors.
- **Lifecycle leak if `await init` resolves after unmount** → Mitigation: a `cancelled` flag in `useEffect` aborts and destroys the renderer if the effect was already cleaned up.
- **Pixel jitter from fractional WASM coords at DPR > 1** → Mitigation: `roundPixels: true` on the Application; for shadows, round target Y to integer.
- **Pixi v8 API churn from v7** → Already on v8 as of install; lock the version in `package.json`.

## Migration Plan

The change is delivered in 8 stages on branch `graphics-pixi-upgrade`. After each stage: `npm run build`, browser smoke test via `chrome-devtools`, commit.

1. Bootstrap Pixi (`SceneRenderer`, mount under React, blank scene).
2. Terrain on Pixi without autotiling (parity with current visual).
3. Units as Pixi sprites (textures from `knightSprite`, bob restored).
4. Shadows + Y-sort.
5. 4-direction sprites + asynchronous walk phase.
6. Decor on walkable tiles.
7a. Analyze `tilemap.png` via `chrome-devtools` and build autotile lookup tables.
7b. Wire autotiling into `terrain.ts`.
8. (Optional) Vignette / lightweight tone overlay.

**Rollback**: each stage is one commit; `git revert` returns to the prior visual state. Full rollback = drop branch `graphics-pixi-upgrade` and stay on `pixel-art-graphics`.

## Open Questions

- Stage 7a classification: if the Kenney tileset is missing certain 4-neighbor combinations (likely for diagonal "inner corner" cases), do we (a) accept the fallback to plain water/stone for those masks, or (b) implement a soft-edge overlay (semi-transparent grass mask) on top of the base tile? Default: (a) for first delivery; (b) deferred.
- Stage 8 vignette: include or skip? Default: skip unless readability of the bright tileset feels harsh in playtesting.
