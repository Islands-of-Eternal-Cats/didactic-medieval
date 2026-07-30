import { Container, Sprite, Texture } from 'pixi.js'
import { RENDER_TILE_SIZE } from './SceneRenderer'
import { GRASS_INDICES, DECOR_INDICES } from './textures'
import { pickTileIndex } from './autotile'

export type TileMapData = {
  cols: number
  rows: number
  tiles: string[]
}

function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

export function buildTerrain(
  map: TileMapData,
  seed: number,
  tileTextures: Texture[],
): Container {
  const container = new Container()
  const rng = seededRandom(seed + 999)
  const decorRng = seededRandom(seed + 777)

  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      const walkable = map.tiles[row][col] === 'G'
      let tileIndex: number
      if (walkable) {
        tileIndex = GRASS_INDICES[Math.floor(rng() * GRASS_INDICES.length)]
      } else {
        const isWater = rng() > 0.5
        const isGrass = (r: number, c: number) =>
          r >= 0 && r < map.rows && c >= 0 && c < map.cols && map.tiles[r][c] === 'G'
        const mask =
          ((isGrass(row - 1, col) ? 1 : 0) << 3) |
          ((isGrass(row, col + 1) ? 1 : 0) << 2) |
          ((isGrass(row + 1, col) ? 1 : 0) << 1) |
          ((isGrass(row, col - 1) ? 1 : 0) << 0)
        tileIndex = pickTileIndex(isWater, mask)
      }
      const sprite = new Sprite(tileTextures[tileIndex])
      sprite.x = col * RENDER_TILE_SIZE
      sprite.y = row * RENDER_TILE_SIZE
      sprite.width = RENDER_TILE_SIZE
      sprite.height = RENDER_TILE_SIZE
      container.addChild(sprite)

      if (walkable && decorRng() < 0.05) {
        const decorIndex = DECOR_INDICES[Math.floor(decorRng() * DECOR_INDICES.length)]
        const decor = new Sprite(tileTextures[decorIndex])
        decor.x = col * RENDER_TILE_SIZE
        decor.y = row * RENDER_TILE_SIZE
        decor.width = RENDER_TILE_SIZE
        decor.height = RENDER_TILE_SIZE
        container.addChild(decor)
      }
    }
  }

  return container
}
