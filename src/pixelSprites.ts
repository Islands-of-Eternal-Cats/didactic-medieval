import tilemapUrl from './assets/tilemap.png'

export const TILE_SIZE = 16
export const COLS = 25
export const ROWS = 19

const SHEET_COLS = 12
const SHEET_ROWS = 11
const PADDING = 1

export const GRASS_INDICES = [0, 1, 2, 25, 39, 40, 41, 42, 43]
export const WATER_INDEX = 48
export const STONE_INDEX = 109

export async function loadTileSheet(): Promise<HTMLCanvasElement[]> {
  const img = new Image()
  img.src = tilemapUrl
  await img.decode()

  const tiles: HTMLCanvasElement[] = []
  for (let row = 0; row < SHEET_ROWS; row++) {
    for (let col = 0; col < SHEET_COLS; col++) {
      const sx = col * (TILE_SIZE + PADDING)
      const sy = row * (TILE_SIZE + PADDING)
      const canvas = document.createElement('canvas')
      canvas.width = TILE_SIZE
      canvas.height = TILE_SIZE
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE)
      tiles.push(canvas)
    }
  }
  return tiles
}

const UNIT_COLORS = ['#e94560', '#4a9eff', '#ffd700', '#7c3aed', '#22c55e', '#f97316']
const ARMOR_COLOR = '#aaa'
const BOOT_COLOR = '#555'
const OUTLINE_COLOR = '#222'

function knightSprite(color: string, frame: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')!
  const pixels: [number, number, string][] = [
    [3, 0, OUTLINE_COLOR], [4, 0, OUTLINE_COLOR], [5, 0, OUTLINE_COLOR], [6, 0, OUTLINE_COLOR], [7, 0, OUTLINE_COLOR], [8, 0, OUTLINE_COLOR], [9, 0, OUTLINE_COLOR], [10, 0, OUTLINE_COLOR], [11, 0, OUTLINE_COLOR], [12, 0, OUTLINE_COLOR],
    [2, 1, OUTLINE_COLOR], [3, 1, color], [4, 1, color], [5, 1, color], [6, 1, color], [7, 1, color], [8, 1, color], [9, 1, color], [10, 1, color], [11, 1, color], [12, 1, color], [13, 1, OUTLINE_COLOR],
    [2, 2, OUTLINE_COLOR], [3, 2, color], [4, 2, color], [5, 2, color], [6, 2, color], [7, 2, color], [8, 2, color], [9, 2, color], [10, 2, color], [11, 2, color], [12, 2, color], [13, 2, OUTLINE_COLOR],
    [2, 3, OUTLINE_COLOR], [3, 3, color], [4, 3, color], [5, 3, color], [6, 3, color], [7, 3, color], [8, 3, color], [9, 3, color], [10, 3, color], [11, 3, color], [12, 3, color], [13, 3, OUTLINE_COLOR],
    [3, 4, OUTLINE_COLOR], [4, 4, color], [5, 4, color], [6, 4, color], [7, 4, color], [8, 4, color], [9, 4, color], [10, 4, color], [11, 4, color], [12, 4, OUTLINE_COLOR],
    [3, 5, OUTLINE_COLOR], [4, 5, OUTLINE_COLOR], [5, 5, OUTLINE_COLOR], [6, 5, OUTLINE_COLOR], [7, 5, OUTLINE_COLOR], [8, 5, OUTLINE_COLOR], [9, 5, OUTLINE_COLOR], [10, 5, OUTLINE_COLOR], [11, 5, OUTLINE_COLOR], [12, 5, OUTLINE_COLOR],
    [3, 6, OUTLINE_COLOR], [4, 6, OUTLINE_COLOR], [5, 6, OUTLINE_COLOR], [6, 6, OUTLINE_COLOR], [7, 6, OUTLINE_COLOR], [8, 6, OUTLINE_COLOR], [9, 6, OUTLINE_COLOR], [10, 6, OUTLINE_COLOR], [11, 6, OUTLINE_COLOR], [12, 6, OUTLINE_COLOR],
    [3, 7, OUTLINE_COLOR], [4, 7, ARMOR_COLOR], [5, 7, ARMOR_COLOR], [6, 7, ARMOR_COLOR], [7, 7, ARMOR_COLOR], [8, 7, ARMOR_COLOR], [9, 7, ARMOR_COLOR], [10, 7, ARMOR_COLOR], [11, 7, ARMOR_COLOR], [12, 7, OUTLINE_COLOR],
    [3, 8, OUTLINE_COLOR], [4, 8, ARMOR_COLOR], [5, 8, ARMOR_COLOR], [6, 8, ARMOR_COLOR], [7, 8, ARMOR_COLOR], [8, 8, ARMOR_COLOR], [9, 8, ARMOR_COLOR], [10, 8, ARMOR_COLOR], [11, 8, ARMOR_COLOR], [12, 8, OUTLINE_COLOR],
    [4, 9, OUTLINE_COLOR], [5, 9, ARMOR_COLOR], [6, 9, ARMOR_COLOR], [7, 9, OUTLINE_COLOR], [8, 9, OUTLINE_COLOR], [9, 9, ARMOR_COLOR], [10, 9, ARMOR_COLOR], [11, 9, OUTLINE_COLOR],
    [5, 10, OUTLINE_COLOR], [6, 10, OUTLINE_COLOR], [7, 10, OUTLINE_COLOR], [8, 10, OUTLINE_COLOR], [9, 10, OUTLINE_COLOR], [10, 10, OUTLINE_COLOR],
    [5, 11, BOOT_COLOR], [6, 11, BOOT_COLOR], [7, 11, OUTLINE_COLOR], [8, 11, OUTLINE_COLOR], [9, 11, BOOT_COLOR], [10, 11, BOOT_COLOR],
    [5, 12, BOOT_COLOR], [6, 12, BOOT_COLOR], [7, 12, OUTLINE_COLOR], [8, 12, OUTLINE_COLOR], [9, 12, BOOT_COLOR], [10, 12, BOOT_COLOR],
  ]
  const legOffset = frame === 0 ? 0 : (frame === 1 ? -1 : 1)
  for (const [x, y, c] of pixels) {
    ctx.fillStyle = c
    const finalX = (y >= 11 && x >= 5 && x <= 6) ? x + legOffset : x
    ctx.fillRect(finalX, y, 1, 1)
  }
  return canvas
}

export { UNIT_COLORS, knightSprite }
