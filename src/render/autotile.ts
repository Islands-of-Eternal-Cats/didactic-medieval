// Autotile lookup tables for water and stone edge transitions.
// Maps a 4-bit neighbor mask (NESW: bit3=N, bit2=E, bit1=S, bit0=W)
// to a tile index from tilemap.png.
// Missing masks fall back to the base water/stone tile.

import { WATER_INDEX, STONE_INDEX } from './textures'

// Water edge tiles (water cell with adjacent grass):
// Determined by scanning tilemap.png for tiles that have a mix of
// grass-green and water-blue pixels in specific quadrant patterns.
export const WATER_EDGE_MAP: Record<number, number> = {
  0: 48,   // no grass neighbors → plain water
  1: 117,  // W grass
  2: 96,   // S grass
  4: 53,   // E grass
  8: 52,   // N grass
  3: 117,  // W+S grass (fallback to 1)
  5: 98,   // N+W grass
  6: 108,  // E+S grass
  9: 48,   // N+W grass (fallback to plain water)
  10: 108, // E+S grass
  12: 121, // N+E grass
  7: 97,   // N+E+W grass
  11: 62,  // N+E+W grass
  13: 49,  // N+E+W grass
  14: 124, // N+E+S grass
  15: 43,  // fully surrounded by grass → water feature
}

// Stone edge tiles — currently fall back to plain stone
// (to be populated in a future pass)
export const STONE_EDGE_MAP: Record<number, number> = {}

export function pickTileIndex(
  isWater: boolean,
  neighborMask: number,
): number {
  const map = isWater ? WATER_EDGE_MAP : STONE_EDGE_MAP
  return map[neighborMask] ?? (isWater ? WATER_INDEX : STONE_INDEX)
}
