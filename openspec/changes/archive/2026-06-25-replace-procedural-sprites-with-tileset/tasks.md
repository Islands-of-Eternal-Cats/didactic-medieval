## 1. Asset setup

- [x] 1.1 Download Tiny Town zip, extract `Tilemap/tilemap.png` to `src/assets/tilemap.png`
- [x] 1.2 Verify tilemap.png dimensions (203×186, 12×11 tiles of 16×16)

## 2. Rust: Remove TILE_SIZE, switch to tile-unit coordinates

- [x] 2.1 Remove `TILE_SIZE` constant and `tile_size` field from `TileMapResource` in `resources.rs`
- [x] 2.2 Update `world_to_tile` to return `(x.floor() as u32, y.floor() as u32)`
- [x] 2.3 Update `tile_to_world` to return `(col as f32 + 0.5, row as f32 + 0.5)`
- [x] 2.4 Update `TicketMapResource::new` to not set `tile_size`
- [x] 2.5 Update `FIELD_WIDTH` from 800.0 to 25.0 and `FIELD_HEIGHT` from 608.0 to 19.0 in `world.rs`
- [x] 2.6 Update `DEFAULT_SPEED` from 60.0 to 3.75 in `systems.rs`
- [x] 2.7 Update `ARRIVAL_THRESHOLD` from 2.0 to 0.125 in `systems.rs`
- [x] 2.8 Update `TileMapResource` is_walkable tests to use tile-unit positions if any exist
- [x] 2.9 Build WASM (`npm run build:wasm`) and verify it compiles

## 3. TypeScript: Rewrite pixelSprites.ts

- [x] 3.1 Keep `TILE_SIZE = 16`, `COLS = 25`, `ROWS = 19`, `UNIT_COLORS`, `knightSprite`
- [x] 3.2 Remove all procedural generation functions (`grassTexture`, `rockTexture`, `waterTile`, `bushDecoration`, `flowerDecoration`, `generateTileVariants`, `drawWaterOverlay`, `TileVariant`)
- [x] 3.3 Add `loadTileSheet()` async function: loads `tilemap.png`, slices into 132 tile canvases with 1px padding offset
- [x] 3.4 Add `getTile(index: number): HTMLCanvasElement` accessor
- [x] 3.5 Add type constants: `GRASS_INDICES`, `WATER_INDEX`, `STONE_INDEX`

## 4. TypeScript: Rewrite tileMapRenderer.ts

- [x] 4.1 Constructor accepts pre-loaded tile canvases array instead of generating procedurally
- [x] 4.2 Build 2D cache: walkable → random grass variant, blocked → water (50%) or stone (50%)
- [x] 4.3 `render()` draws each tile from cache at `(col * 16, row * 16)`
- [x] 4.4 Remove water animation overlay (Tiny Town water is static)
- [x] 4.5 Remove `time` parameter from `render()` (no animated tiles)

## 5. TypeScript: Update UnitsCanvas.tsx

- [x] 5.1 Change `FIELD_WIDTH` to 400, `FIELD_HEIGHT` to 304
- [x] 5.2 Set canvas CSS size to 800×608 (2× integer scale)
- [x] 5.3 Update `setupCanvas`: pixel size = 400/304 × dpr, CSS size = 800×608
- [x] 5.4 Convert WASM positions from tile-units to pixels: `unit.x * TILE_SIZE`, `unit.y * TILE_SIZE`
- [x] 5.5 Update sprite centering: `drawImage(sprite, pixelX - 8, pixelY - 16 + bobOffset)`
- [x] 5.6 Add async spritesheet loading before creating TileMapRenderer
- [x] 5.7 Remove `elapsed` time param from `mapRenderer.render()` call

## 6. Build and verify

- [x] 6.1 Rebuild WASM (`npm run build:wasm`)
- [x] 6.2 Run frontend build/lint (`npm run build`)
- [x] 6.3 Start dev server and verify tiles render correctly at 2× scale
- [x] 6.4 Verify units move correctly on the map
- [x] 6.5 Verify CSS scaling is pixel-perfect (no blurriness)
