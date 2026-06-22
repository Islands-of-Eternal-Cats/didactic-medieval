import { useCallback, useEffect, useRef } from 'react'
import { createGameWorld, type GameWorld } from '../pkg/core'

export type UnitPosition = {
  id: number
  x: number
  y: number
}

const FIELD_WIDTH = 800
const FIELD_HEIGHT = 600
const UNIT_RADIUS = 4
const DEFAULT_UNIT_COUNT = 50

function parseUnitPositions(json: string): UnitPosition[] {
  return JSON.parse(json) as UnitPosition[]
}

function drawUnits(ctx: CanvasRenderingContext2D, units: UnitPosition[]) {
  ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)
  ctx.fillStyle = '#e94560'
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
    const units = parseUnitPositions(world.getUnitPositions())
    drawUnits(ctx, units)

    return () => {
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
