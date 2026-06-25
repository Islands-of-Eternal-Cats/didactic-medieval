export const TILE_SIZE = 32
export const COLS = 25
export const ROWS = 19

const GRASS_BASE = [
  '#3a7d32', '#3a8035', '#3a7a2f', '#3b7e33',
]
const GRASS_DARK = '#2d5a27'
const GRASS_LIGHT = '#4a8d3a'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0x100000000
  }
}

function grassTexture(rng: () => number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TILE_SIZE
  canvas.height = TILE_SIZE
  const ctx = canvas.getContext('2d')!
  const base = GRASS_BASE[Math.floor(rng() * GRASS_BASE.length)]
  ctx.fillStyle = base
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(rng() * TILE_SIZE)
    const y = Math.floor(rng() * TILE_SIZE)
    ctx.fillStyle = rng() > 0.5 ? GRASS_DARK : GRASS_LIGHT
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.fillStyle = GRASS_DARK
  ctx.fillRect(0, 0, TILE_SIZE, 1)
  ctx.fillRect(0, 0, 1, TILE_SIZE)
  return canvas
}

function bushDecoration(rng: () => number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TILE_SIZE
  canvas.height = TILE_SIZE
  const ctx = canvas.getContext('2d')!
  const cx = 6 + Math.floor(rng() * 12)
  const cy = 6 + Math.floor(rng() * 10)
  const size = 6 + Math.floor(rng() * 4)
  ctx.fillStyle = '#2d6b2d'
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      if (dx * dx + dy * dy < size * size && rng() > 0.3) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1)
      }
    }
  }
  ctx.fillStyle = '#4a9d4a'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(
      cx + Math.floor(rng() * size * 2) - size,
      cy + Math.floor(rng() * size * 2) - size,
      1, 1,
    )
  }
  return canvas
}

function flowerDecoration(rng: () => number, color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TILE_SIZE
  canvas.height = TILE_SIZE
  const ctx = canvas.getContext('2d')!
  const cx = 8 + Math.floor(rng() * 14)
  const cy = 8 + Math.floor(rng() * 12)
  ctx.fillStyle = color
  const petalOffsets = [[0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]]
  for (const [dx, dy] of petalOffsets) {
    ctx.fillRect(cx + dx, cy + dy, 1, 1)
  }
  ctx.fillStyle = '#ffdd00'
  ctx.fillRect(cx, cy, 1, 1)
  return canvas
}

export function rockTexture(rng: () => number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TILE_SIZE
  canvas.height = TILE_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#5a5a6e'
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(rng() * TILE_SIZE)
    const y = Math.floor(rng() * TILE_SIZE)
    ctx.fillStyle = rng() > 0.5 ? '#6a6a7e' : '#4a4a5e'
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.fillStyle = '#3a3a4e'
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(rng() * (TILE_SIZE - 6)) + 3
    const y = Math.floor(rng() * (TILE_SIZE - 6)) + 3
    const len = 3 + Math.floor(rng() * 5)
    const horiz = rng() > 0.5
    for (let j = 0; j < len; j++) {
      ctx.fillRect(horiz ? x + j : x, horiz ? y : y + j, 1, 1)
    }
  }
  ctx.fillStyle = '#3a3a4e'
  ctx.fillRect(0, 0, TILE_SIZE, 1)
  ctx.fillRect(0, 0, 1, TILE_SIZE)
  return canvas
}

export function waterTile(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TILE_SIZE
  canvas.height = TILE_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#1a2a4e'
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
  for (let row = 0; row < TILE_SIZE; row += 4) {
    ctx.fillStyle = '#2a4a6e'
    ctx.fillRect(0, row, TILE_SIZE, 1)
  }
  return canvas
}

const WATER_HIGHLIGHT = '#4a8aff'

export function drawWaterOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const hx = ((time * 60) % (TILE_SIZE - 4)) + 2
  const hy = (time * 100) % TILE_SIZE
  ctx.fillStyle = WATER_HIGHLIGHT
  ctx.fillRect(x + hx, y + hy, 1, 1)
  ctx.fillRect(x + ((hx + 8) % TILE_SIZE), y + ((hy + 4) % TILE_SIZE), 1, 1)
}

export type TileVariant = {
  type: 'grass'
  image: HTMLCanvasElement
  decoration?: HTMLCanvasElement
}

export function generateTileVariants(seed: number): TileVariant[][] {
  const variants: TileVariant[][] = []
  for (let row = 0; row < ROWS; row++) {
    const rowVariants: TileVariant[] = []
    for (let col = 0; col < COLS; col++) {
      const tileRng = seededRandom(seed + col * 7 + row * 31)
      const image = grassTexture(tileRng) as HTMLCanvasElement
      let decoration: HTMLCanvasElement | undefined
      if (tileRng() < 0.2) {
        const decoRng = seededRandom(seed + col * 13 + row * 37)
        if (decoRng() > 0.5) {
          decoration = bushDecoration(decoRng) as HTMLCanvasElement
        } else {
          decoration = flowerDecoration(decoRng, '#e94560') as HTMLCanvasElement
        }
      }
      rowVariants.push({ type: 'grass', image, decoration })
    }
    variants.push(rowVariants)
  }
  return variants
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
