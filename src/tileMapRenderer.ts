import { TILE_SIZE, GRASS_INDICES, WATER_INDEX, STONE_INDEX } from './pixelSprites'

export type TileMapData = {
  cols: number
  rows: number
  tiles: string[]
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0x100000000
  }
}

export class TileMapRenderer {
  private tileCache: HTMLCanvasElement[][]

  constructor(map: TileMapData, seed: number, tileCanvases: HTMLCanvasElement[]) {
    const rng = seededRandom(seed + 999)
    this.tileCache = []
    for (let row = 0; row < map.rows; row++) {
      const rowCache: HTMLCanvasElement[] = []
      for (let col = 0; col < map.cols; col++) {
        const walkable = map.tiles[row][col] === 'G'
        if (walkable) {
          const grassIdx = GRASS_INDICES[Math.floor(rng() * GRASS_INDICES.length)]
          rowCache.push(tileCanvases[grassIdx])
        } else {
          const blockedIdx = rng() > 0.5 ? WATER_INDEX : STONE_INDEX
          rowCache.push(tileCanvases[blockedIdx])
        }
      }
      this.tileCache.push(rowCache)
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (let row = 0; row < this.tileCache.length; row++) {
      for (let col = 0; col < this.tileCache[row].length; col++) {
        const x = col * TILE_SIZE
        const y = row * TILE_SIZE
        ctx.drawImage(this.tileCache[row][col], x, y)
      }
    }
  }
}
