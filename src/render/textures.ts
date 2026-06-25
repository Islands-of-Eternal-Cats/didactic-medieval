import { Texture, Rectangle, Assets } from 'pixi.js'
import tilemapUrl from '../assets/tilemap.png'
import { knightSprite, type Direction } from '../pixelSprites'

export const TILE_SHEET_COLS = 12
export const TILE_SHEET_ROWS = 11
export const TILE_SOURCE_SIZE = 16
export const TILE_PADDING = 1

export const GRASS_INDICES = [0, 1, 2]
export const WATER_INDEX = 48
export const STONE_INDEX = 109
export const DECOR_INDICES = [4, 5, 14, 15, 16]

let tileTexturesPromise: Promise<Texture[]> | null = null

export function loadTileTextures(): Promise<Texture[]> {
  if (tileTexturesPromise) return tileTexturesPromise
  tileTexturesPromise = (async () => {
    const baseTexture = await Assets.load<Texture>(tilemapUrl)
    baseTexture.source.scaleMode = 'nearest'

    const textures: Texture[] = []
    for (let row = 0; row < TILE_SHEET_ROWS; row++) {
      for (let col = 0; col < TILE_SHEET_COLS; col++) {
        const sx = col * (TILE_SOURCE_SIZE + TILE_PADDING)
        const sy = row * (TILE_SOURCE_SIZE + TILE_PADDING)
        const tex = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(sx, sy, TILE_SOURCE_SIZE, TILE_SOURCE_SIZE),
        })
        textures.push(tex)
      }
    }
    return textures
  })()
  return tileTexturesPromise
}

const knightTextureCache = new Map<string, Texture>()

export function getKnightTexture(
  color: string,
  frame: number,
  direction: Direction = 'S',
): Texture {
  const key = `${color}-${direction}-${frame}`
  const cached = knightTextureCache.get(key)
  if (cached) return cached
  const canvas = knightSprite(color, frame, direction)
  const tex = Texture.from(canvas)
  tex.source.scaleMode = 'nearest'
  knightTextureCache.set(key, tex)
  return tex
}
