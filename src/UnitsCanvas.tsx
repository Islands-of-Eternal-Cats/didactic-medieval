import { useCallback, useEffect, useRef } from 'react'
import { createGameWorld, type GameWorld } from '../pkg/core'
import { TILE_SIZE, knightSprite, UNIT_COLORS, loadTileSheet } from './pixelSprites'
import { TileMapRenderer, type TileMapData } from './tileMapRenderer'

export type UnitPosition = {
  id: number
  x: number
  y: number
}

const FIELD_WIDTH = 400
const FIELD_HEIGHT = 304
const CSS_SCALE = 2
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
    canvas.style.width = `${FIELD_WIDTH * CSS_SCALE}px`
    canvas.style.height = `${FIELD_HEIGHT * CSS_SCALE}px`
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

    let cancelled = false
    let rafId = 0

    ;(async () => {
      const tileCanvases = await loadTileSheet()
      if (cancelled) return

      worldRef.current?.free()
      knightCacheRef.current.clear()
      mapRendererRef.current = null

      const world = createGameWorld(DEFAULT_UNIT_COUNT, BigInt(seed))
      worldRef.current = world

      const tileMapJson = world.getTileMap()
      const tileMap = parseTileMap(tileMapJson)
      const mapRenderer = new TileMapRenderer(tileMap, seed, tileCanvases)
      mapRendererRef.current = mapRenderer

      let lastTime = performance.now()
      let startTime = performance.now()

      const frame = (now: number) => {
        if (cancelled) return

        const deltaMs = now - lastTime
        lastTime = now
        const elapsed = (now - startTime) / 1000

        world.tick(deltaMs)
        const units = parseUnitPositions(world.getUnitPositions())

        ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)
        mapRenderer.render(ctx)

        for (const unit of units) {
          const colorIndex = unit.id % UNIT_COLORS.length
          const color = UNIT_COLORS[colorIndex]
          const sprite = getKnightSprite(color, elapsed)
          const bobOffset = Math.sin(elapsed * 2 + unit.id) * 0.5
          const px = unit.x * TILE_SIZE
          const py = unit.y * TILE_SIZE
          ctx.drawImage(sprite, px - 8, py - 16 + bobOffset)
        }

        rafId = requestAnimationFrame(frame)
      }

      rafId = requestAnimationFrame(frame)
    })()

    return () => {
      cancelled = true
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
