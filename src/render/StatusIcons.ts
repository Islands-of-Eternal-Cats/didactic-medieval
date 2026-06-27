import { Container, Graphics } from 'pixi.js'
import { RENDER_TILE_SIZE } from './SceneRenderer'

export type UnitState = {
  id: number
  satiation: number
  energy: number
  hungry: boolean
  tired: boolean
  needsPlan: string
}

function parseUnitStates(json: string): UnitState[] {
  return JSON.parse(json) as UnitState[]
}

export class StatusIcons {
  private readonly container: Container
  private icons = new Map<number, Graphics[]>()

  constructor(container: Container) {
    this.container = container
  }

  sync(json: string, positions: { id: number; x: number; y: number }[]): void {
    const states = parseUnitStates(json)
    const posMap = new Map(positions.map((p) => [p.id, p]))

    const seen = new Set<number>()

    for (const st of states) {
      if (!st.hungry && !st.tired) continue
      seen.add(st.id)

      const pos = posMap.get(st.id)
      if (!pos) continue

      let icons = this.icons.get(st.id)
      if (!icons) {
        icons = []
        this.icons.set(st.id, icons)
      }

      const screenX = pos.x * RENDER_TILE_SIZE
      const screenY = pos.y * RENDER_TILE_SIZE - RENDER_TILE_SIZE - 4

      while (icons.length < 2) {
        const g = new Graphics()
        this.container.addChild(g)
        icons.push(g)
      }

      let idx = 0
      if (st.hungry) {
        const g = icons[idx]
        g.clear()
        g.position.set(screenX - 6, screenY)
        g.poly([4, 0, 8, 10, 0, 10])
        g.fill({ color: 0xffcc00 })
        g.position.set(screenX - 6 + idx * 14, screenY)
        idx++
      }
      if (st.tired) {
        const g = icons[idx]
        g.clear()
        g.position.set(screenX - 6 + (st.hungry ? 14 : 0), screenY)
        g.arc(5, 5, 5, Math.PI, 0)
        g.fill({ color: 0x4488ff })
        idx++
      }

      for (let i = idx; i < icons.length; i++) {
        icons[i].clear()
      }
    }

    for (const [id, icons] of this.icons) {
      if (!seen.has(id)) {
        for (const g of icons) {
          g.clear()
        }
      }
    }
  }

  destroy(): void {
    for (const icons of this.icons.values()) {
      for (const g of icons) {
        g.removeFromParent()
      }
    }
    this.icons.clear()
  }
}
