import { Container, Graphics } from 'pixi.js'
import { RENDER_TILE_SIZE } from './SceneRenderer'

export type MapObject = {
  col: number
  row: number
  kind: 'wall' | 'bed' | 'campfire'
}

function parseMapObjects(json: string): MapObject[] {
  return JSON.parse(json) as MapObject[]
}

export class BuildingRenderer {
  private readonly container: Container
  private sprites = new Map<string, Graphics>()

  constructor(container: Container) {
    this.container = container
  }

  sync(json: string): void {
    const objects = parseMapObjects(json)
    const seen = new Set<string>()

    for (const obj of objects) {
      const key = `${obj.col},${obj.row}`
      seen.add(key)

      let g = this.sprites.get(key)
      if (!g) {
        g = new Graphics()
        g.position.set(
          obj.col * RENDER_TILE_SIZE,
          obj.row * RENDER_TILE_SIZE,
        )
        this.sprites.set(key, g)
        this.container.addChild(g)
      }
      this.drawObject(g, obj.kind)
    }

    for (const [key, g] of this.sprites) {
      if (!seen.has(key)) {
        g.removeFromParent()
        this.sprites.delete(key)
      }
    }
  }

  private drawObject(g: Graphics, kind: string): void {
    g.clear()
    switch (kind) {
      case 'wall':
        g.rect(0, 0, RENDER_TILE_SIZE, RENDER_TILE_SIZE)
        g.fill({ color: 0x666666 })
        g.stroke({ color: 0x444444, width: 1 })
        break
      case 'bed':
        g.rect(4, RENDER_TILE_SIZE - 8, RENDER_TILE_SIZE - 8, 6)
        g.fill({ color: 0x8b4513 })
        g.rect(4, RENDER_TILE_SIZE - 14, RENDER_TILE_SIZE - 8, 6)
        g.fill({ color: 0x654321 })
        break
      case 'campfire': {
        g.circle(16, 20, 6)
        g.fill({ color: 0x8b4513 })
        g.circle(16, 18, 4)
        g.fill({ color: 0xff6600 })
        g.circle(16, 17, 2)
        g.fill({ color: 0xffcc00 })
        break
      }
    }
  }

  destroy(): void {
    for (const g of this.sprites.values()) {
      g.removeFromParent()
    }
    this.sprites.clear()
  }
}
