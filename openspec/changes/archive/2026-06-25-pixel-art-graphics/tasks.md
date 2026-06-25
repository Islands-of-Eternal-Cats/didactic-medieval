## 1. Create procedural pixel-art sprite generators

- [x] 1.1 Create `src/pixelSprites.ts` with grass tile generator, seeded RNG, and constants
- [x] 1.2 Add bush and flower decoration generators
- [x] 1.3 Add rock tile generator
- [x] 1.4 Add animated water tile generator and overlay function
- [x] 1.5 Add main tile generation dispatcher (`generateTileVariants`)
- [x] 1.6 Add knight sprite generator with walking animation frames and color palette

## 2. Create tile map caching and renderer

- [x] 2.1 Create `src/tileMapRenderer.ts` with `TileMapRenderer` class that pre-renders tile canvases into a 2D cache
- [x] 2.2 Implement `render(ctx, time)` method drawing cached tiles, decorations, and water animation

## 3. Integrate pixel-art pipeline into UI

- [x] 3.1 Update `src/UnitsCanvas.tsx` — replace flat-color rendering with pixel-art imports and sprite rendering
- [x] 3.2 Add unit sprite caching per color+frame and vertical bob animation

## 4. Build and verify

- [x] 4.1 Build WASM: `wasm-pack build crates/core --target web --out-dir ../../pkg`
- [x] 4.2 Build frontend: `npm run build`
- [x] 4.3 Start dev server: `npm run dev` — verify pixel-art tiles and knight sprites render
