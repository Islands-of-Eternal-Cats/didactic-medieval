## Why

Replace flat-color canvas rendering with procedural pixel-art sprites (tiles + units) to significantly improve the visual quality and game-like feel of the simulation. The current flat-color rendering is utilitarian and lacks personality.

## What Changes

- Add procedural pixel-art tile texture generators (grass, rock, water with decorations)
- Add procedural pixel-art knight sprite generator with walking animation
- Create a tile map renderer that pre-renders tile canvases into a cache and composites frames
- Wire the pixel-art pipeline into the existing `UnitsCanvas.tsx` component
- No changes to Rust ECS — it continues sending only tile grid + unit position data

## Capabilities

### New Capabilities
- `pixel-art-tiles`: Procedural generation of pixel-art tile textures (grass with decorations, rock, animated water) using seeded randomness for deterministic output
- `pixel-art-units`: Procedural generation of pixel-art knight sprites with color variants and walking animation frames
- `tile-map-rendering`: Pre-renders tile map into cached canvases at init, renders animated frames compositing tile layers and unit sprites

### Modified Capabilities

<!-- No existing capabilities modified -->

## Impact

- New files: `src/pixelSprites.ts`, `src/tileMapRenderer.ts`
- Modified file: `src/UnitsCanvas.tsx`
- No changes to Rust WASM package or ECS architecture
- No new dependencies — uses Canvas 2D API only
