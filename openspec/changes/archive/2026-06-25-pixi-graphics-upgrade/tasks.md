## 1. Bootstrap Pixi

- [x] 1.1 Install `pixi.js` dependency
- [x] 1.2 Create `src/render/SceneRenderer.ts` with Pixi `Application` lifecycle (init, destroy, 4 layers)
- [x] 1.3 Rewrite `src/UnitsCanvas.tsx` to mount `SceneRenderer` and drive WASM world via `app.ticker`
- [x] 1.4 Build and verify via `chrome-devtools`: canvas exists at 800×608 CSS, WebGL2 context active, no console errors

## 2. Terrain on Pixi (no autotiling)

- [x] 2.1 Create `src/render/textures.ts` loading `tilemap.png` as shared `TextureSource`, slicing 132 tile textures
- [x] 2.2 Create `src/render/terrain.ts` with `buildTerrain()` producing a static `Container` of `Sprite` per cell (32×32 px)
- [x] 2.3 Wire terrain into `UnitsCanvas` lifecycle (build once per seed)
- [x] 2.4 Build and verify: terrain renders visually matching old Canvas 2D behaviour (random grass variants, plain water/stone for `B`)

## 3. Units as Pixi Sprites

- [x] 3.1 Create `src/render/UnitSprite.ts` wrapping a `PIXI.Sprite` with position update, bob animation, and shadow `Graphics`
- [x] 3.2 Create lazy texture cache in `textures.ts` for `(color, frame)` from `knightSprite()` in `pixelSprites.ts`
- [x] 3.3 Wire UnitSprite pool into ticker (create N sprites on init, update positions each tick, destroy on cleanup)
- [x] 3.4 Build and verify: 50 units animate with bob on Pixi, matching visual parity with old Canvas 2D

## 4. Y-Sort and Shadows

- [x] 4.1 Enable `sortableChildren` on units layer; set `zIndex = Math.round(y)` each frame
- [x] 4.2 Implement elliptical shadow in `layers.decals` per unit (Graphics ellipse, alpha ≈ 0.35, no bob)
- [x] 4.3 Build and verify: units lower on screen occlude higher ones; shadows visible and stationary under each unit

## 5. Directions and Asynchronous Animation

- [x] 5.1 Expand `knightSprite(color, frame, direction)` in `pixelSprites.ts` with 4 facing variants (N/S/E/W, W mirror of E)
- [x] 5.2 Add `update(pos, deltaMs)` in `UnitSprite.ts` computing velocity → direction with jitter threshold
- [x] 5.3 Add per-unit animation `phase` with seeded offset; advance only while moving; idle = frame 0
- [x] 5.4 Update texture cache key to `(color, direction, frame)` 
- [x] 5.5 Build and verify: units face their movement direction; walk cycles are desynchronised; idle units stand still

## 6. Decor on Walkable Tiles

- [x] 6.1 Extend `buildTerrain()` to scatter decor sprites (flowers/plants from tileset) on ~5% of walkable cells using seeded RNG
- [x] 6.2 Build and verify: decor appears deterministically per seed on grass cells, does not block units

## 7. Autotiling

- [x] 7a.1 Use `chrome-devtools_new_page` to load `tilemap.png`; run `evaluate_script` with canvas `getImageData` to classify all 132 tiles by corner/centre pixel signatures
- [x] 7a.2 Build bitmask→tileIndex lookup tables for grass↔water and grass↔stone borders; write as TS constants in `src/render/autotile.ts`
- [x] 7b.1 Implement `pickTileIndex(cellType, bitmask): number` using the lookup tables with plain-tile fallback
- [x] 7b.2 Integrate autotile into `buildTerrain()`: non-grass cells now pick from transitions instead of random water/stone
- [x] 7b.3 Build and verify: water and stone edges smoothly blend with neighbouring grass tiles; fallback works for missing masks

## 8. Polish and Verification

- [x] 8.1 Remove old Canvas 2D code paths (`src/tileMapRenderer.ts`, leftover `ctx` logic)
- [x] 8.2 Update `src/App.css` if needed for new scene dimensions
- [x] 8.3 Run `npm run build` (production bundle); verify zero TS errors and no Vite warnings beyond bundle size advisory
- [x] 8.4 Final browser smoke test via `chrome-devtools`: check console, canvas size, WebGL, terrain, units, shadows, directions, decor, autotiling
