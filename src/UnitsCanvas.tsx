import { useCallback, useEffect, useRef } from 'react'
import { createGameWorld, type GameWorld } from '../pkg/core'
import { knightSprite, UNIT_COLORS } from './pixelSprites'
import { TileMapRenderer, type TileMapData } from './tileMapRenderer'

export type UnitPosition = {
  id: number
  x: number
  y: number
}

const FIELD_WIDTH = 800
const FIELD_HEIGHT = 608
const DEFAULT_UNIT_COUNT = 50

function parseUnitPositions(json: string): UnitPosition[] {
  return JSON.parse(json) as UnitPosition[]
}

function parseTileMap(json: string): TileMapData {
  return JSON.parse(json) as TileMapData
}

type UnitsCanvasProps = {
  seed: number
  onRegenerate: () => void
}

export function UnitsCanvas({ seed, onRegenerate }: UnitsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<GameWorld | null>(null)
  const knightCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const mapRendererRef = useRef<TileMapRenderer | null>(null)

  const getKnightSprite = useCallback((color: string, time: number) => {
    const moving = true
    const frame = moving ? (Math.floor(time / 0.3) % 3) : 0
    const key = `${color}-${frame}`
    const cached = knightCacheRef.current.get(key)
    if (cached) return cached
    const sprite = knightSprite(color, frame)
    knightCacheRef.current.set(key, sprite)
    return sprite
  }, [])

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = FIELD_WIDTH * dpr
    canvas.height = FIELD_HEIGHT * dpr
    canvas.style.width = `${FIELD_WIDTH}px`
    canvas.style.height = `${FIELD_HEIGHT}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false
    return ctx
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = setupCanvas(canvas)
    if (!ctx) return

    worldRef.current?.free()
    knightCacheRef.current.clear()
    mapRendererRef.current = null

    const world = createGameWorld(DEFAULT_UNIT_COUNT, BigInt(seed))
    worldRef.current = world

    const tileMapJson = world.getTileMap()
    const tileMap = parseTileMap(tileMapJson)
    const mapRenderer = new TileMapRenderer(tileMap, seed)
    mapRendererRef.current = mapRenderer

    let rafId = 0
    let lastTime = performance.now()
    let startTime = performance.now()

    const frame = (now: number) => {
      const deltaMs = now - lastTime
      lastTime = now
      const elapsed = (now - startTime) / 1000

      world.tick(deltaMs)
      const units = parseUnitPositions(world.getUnitPositions())

      ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)
      mapRenderer.render(ctx, elapsed)

      for (const unit of units) {
        const colorIndex = unit.id % UNIT_COLORS.length
        const color = UNIT_COLORS[colorIndex]
        const sprite = getKnightSprite(color, elapsed)
        const bobOffset = Math.sin(elapsed * 2 + unit.id) * 0.5
        ctx.drawImage(sprite, unit.x - 8, unit.y - 16 + bobOffset)
      }

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      worldRef.current?.free()
      worldRef.current = null
      mapRendererRef.current = null
    }
  }, [seed, setupCanvas, getKnightSprite])

  return (
    <section className="units-section">
      <canvas ref={canvasRef} className="units-canvas" />
      <button type="button" className="regenerate-btn" onClick={onRegenerate}>
        Перегенерировать
      </button>
    </section>
  )
}
