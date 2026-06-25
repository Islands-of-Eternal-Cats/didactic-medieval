import { useCallback, useEffect, useRef } from 'react'
import { createGameWorld, type GameWorld } from '../pkg/core'

export type UnitPosition = {
  id: number
  x: number
  y: number
}

export type TileMapData = {
  cols: number
  rows: number
  tiles: string[]
}

const FIELD_WIDTH = 800
const FIELD_HEIGHT = 608
const TILE_SIZE = 32
const UNIT_RADIUS = 4
const DEFAULT_UNIT_COUNT = 50
const COLOR_WALKABLE = '#2d5a27'
const COLOR_BLOCKED = '#1a1a2e'
const COLOR_UNIT = '#e94560'

function parseUnitPositions(json: string): UnitPosition[] {
  return JSON.parse(json) as UnitPosition[]
}

function parseTileMap(json: string): TileMapData {
  return JSON.parse(json) as TileMapData
}

function drawTileMap(ctx: CanvasRenderingContext2D, map: TileMapData) {
  for (let row = 0; row < map.rows; row++) {
    const line = map.tiles[row]
    for (let col = 0; col < map.cols; col++) {
      const walkable = line[col] === 'G'
      ctx.fillStyle = walkable ? COLOR_WALKABLE : COLOR_BLOCKED
      ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    }
  }
}

function drawUnits(ctx: CanvasRenderingContext2D, units: UnitPosition[]) {
  ctx.fillStyle = COLOR_UNIT
  for (const unit of units) {
    ctx.beginPath()
    ctx.arc(unit.x, unit.y, UNIT_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  }
}

type UnitsCanvasProps = {
  seed: number
  onRegenerate: () => void
}

export function UnitsCanvas({ seed, onRegenerate }: UnitsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<GameWorld | null>(null)

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = FIELD_WIDTH * dpr
    canvas.height = FIELD_HEIGHT * dpr
    canvas.style.width = `${FIELD_WIDTH}px`
    canvas.style.height = `${FIELD_HEIGHT}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return ctx
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = setupCanvas(canvas)
    if (!ctx) return

    worldRef.current?.free()
    const world = createGameWorld(DEFAULT_UNIT_COUNT, BigInt(seed))
    worldRef.current = world

    const tileMapJson = world.getTileMap()
    const tileMap = parseTileMap(tileMapJson)
    drawTileMap(ctx, tileMap)

    const initialUnits = parseUnitPositions(world.getUnitPositions())
    drawUnits(ctx, initialUnits)

    let rafId = 0
    let lastTime = performance.now()

    const frame = (now: number) => {
      const deltaMs = now - lastTime
      lastTime = now
      world.tick(deltaMs)
      const units = parseUnitPositions(world.getUnitPositions())
      drawTileMap(ctx, tileMap)
      drawUnits(ctx, units)
      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      worldRef.current?.free()
      worldRef.current = null
    }
  }, [seed, setupCanvas])

  return (
    <section className="units-section">
      <canvas ref={canvasRef} className="units-canvas" />
      <button type="button" className="regenerate-btn" onClick={onRegenerate}>
        Перегенерировать
      </button>
    </section>
  )
}
