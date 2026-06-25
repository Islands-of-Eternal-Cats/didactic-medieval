import { useEffect, useRef } from 'react'
import { createGameWorld, type GameWorld } from '../pkg/core'
import { SceneRenderer, SCENE_WIDTH, SCENE_HEIGHT } from './render/SceneRenderer'
import { loadTileTextures } from './render/textures'
import { buildTerrain, type TileMapData } from './render/terrain'
import { UnitSprite } from './render/UnitSprite'

export type UnitPosition = {
  id: number
  x: number
  y: number
}

const DEFAULT_UNIT_COUNT = 50

function parseTileMap(json: string): TileMapData {
  return JSON.parse(json) as TileMapData
}

function parseUnitPositions(json: string): UnitPosition[] {
  return JSON.parse(json) as UnitPosition[]
}

type UnitsCanvasProps = {
  seed: number
  onRegenerate: () => void
}

export function UnitsCanvas({ seed, onRegenerate }: UnitsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = containerRef.current
    if (!parent) return

    let cancelled = false
    let scene: SceneRenderer | null = null
    let world: GameWorld | null = null
    let units: UnitSprite[] = []

    ;(async () => {
      const renderer = new SceneRenderer()
      await renderer.init(parent)
      if (cancelled) {
        renderer.destroy()
        return
      }
      scene = renderer

      const tileTextures = await loadTileTextures()
      if (cancelled) {
        renderer.destroy()
        return
      }

      world = createGameWorld(DEFAULT_UNIT_COUNT, BigInt(seed))
      const tileMap = parseTileMap(world.getTileMap())
      const terrain = buildTerrain(tileMap, seed, tileTextures)
      renderer.layers.terrain.addChild(terrain)

      for (let i = 0; i < DEFAULT_UNIT_COUNT; i++) {
        units.push(new UnitSprite(i, renderer.layers.units, renderer.layers.decals))
      }

      renderer.app.ticker.add((ticker) => {
        if (!world) return
        world.tick(ticker.deltaMS)
        const positions = parseUnitPositions(world.getUnitPositions())
        for (const pos of positions) {
          const unit = units[pos.id]
          if (unit) {
            unit.update(pos.x, pos.y, ticker.deltaMS)
          }
        }
      })
    })()

    return () => {
      cancelled = true
      for (const u of units) u.destroy()
      units = []
      world?.free()
      world = null
      scene?.destroy()
      scene = null
      while (parent.firstChild) parent.removeChild(parent.firstChild)
    }
  }, [seed])

  return (
    <section className="units-section">
      <div
        ref={containerRef}
        className="units-canvas"
        style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT }}
      />
      <button type="button" className="regenerate-btn" onClick={onRegenerate}>
        Перегенерировать
      </button>
    </section>
  )
}
