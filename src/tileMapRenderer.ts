import { TILE_SIZE, generateTileVariants, rockTexture, waterTile, drawWaterOverlay, type TileVariant } from './pixelSprites'

export type TileMapData = {
  cols: number
  rows: number
  tiles: string[]
}

export class TileMapRenderer {
  private tileCache: (TileVariant | { type: 'rock'; image: HTMLCanvasElement } | { type: 'water'; image: HTMLCanvasElement })[][]

  constructor(map: TileMapData, seed: number) {
    const rng = () => {
      let s = seed + 999
      return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff
        return (s >>> 0) / 0x100000000
      }
    }
    const rockRng = rng()
    this.tileCache = []
    const grassVariants = generateTileVariants(seed)
    for (let row = 0; row < map.rows; row++) {
      const rowCache: (TileVariant | { type: 'rock'; image: HTMLCanvasElement } | { type: 'water'; image: HTMLCanvasElement })[] = []
      for (let col = 0; col < map.cols; col++) {
        const walkable = map.tiles[row][col] === 'G'
        if (walkable) {
          rowCache.push(grassVariants[row][col])
        } else {
          if (rockRng() > 0.4) {
            rowCache.push({ type: 'rock', image: rockTexture(rockRng) })
          } else {
            rowCache.push({ type: 'water', image: waterTile() })
          }
        }
      }
      this.tileCache.push(rowCache)
    }
  }

  render(ctx: CanvasRenderingContext2D, time: number) {
    for (let row = 0; row < this.tileCache.length; row++) {
      for (let col = 0; col < this.tileCache[row].length; col++) {
        const x = col * TILE_SIZE
        const y = row * TILE_SIZE
        const entry = this.tileCache[row][col]
        if (entry.type === 'grass') {
          ctx.drawImage(entry.image, x, y)
          if (entry.decoration) {
            ctx.drawImage(entry.decoration, x, y)
          }
        } else if (entry.type === 'rock') {
          ctx.drawImage(entry.image, x, y)
        } else if (entry.type === 'water') {
          ctx.drawImage(entry.image, x, y)
          drawWaterOverlay(ctx, x, y, time)
        }
      }
    }
  }
}
