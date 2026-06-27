import { Container, Graphics, Sprite } from 'pixi.js'
import { RENDER_TILE_SIZE } from './SceneRenderer'
import { getKnightTexture } from './textures'
import { UNIT_COLORS, type Direction } from '../pixelSprites'

const BOB_AMPLITUDE = 1
const SHADOW_WIDTH = 20
const SHADOW_HEIGHT = 6
const JITTER_THRESHOLD = 0.02

export class UnitSprite {
  readonly sprite: Sprite
  readonly shadow: Graphics
  readonly id: number
  private readonly colorIndex: number
  private direction: Direction = 'S'

  lastX = 0
  lastY = 0
  phase = 0

  constructor(id: number, container: Container, decalsContainer: Container) {
    this.id = id
    this.colorIndex = id % UNIT_COLORS.length
    this.phase = (id * 73) % 900

    const texture = getKnightTexture(UNIT_COLORS[this.colorIndex], 0, this.direction)
    this.sprite = new Sprite(texture)
    this.sprite.anchor.set(0.5, 1)
    this.sprite.width = RENDER_TILE_SIZE
    this.sprite.height = RENDER_TILE_SIZE
    container.addChild(this.sprite)

    this.shadow = new Graphics()
    this.shadow.ellipse(0, 0, SHADOW_WIDTH / 2, SHADOW_HEIGHT / 2)
    this.shadow.fill({ color: 0x000000, alpha: 0.35 })
    decalsContainer.addChild(this.shadow)
  }

  update(x: number, y: number, deltaMs: number): void {
    const dx = x - this.lastX
    const dy = y - this.lastY
    const moving = Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001

    if (moving) {
      this.phase += deltaMs
    }

    if (Math.abs(dx) > JITTER_THRESHOLD || Math.abs(dy) > JITTER_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'E' : 'W'
      } else {
        this.direction = dy > 0 ? 'S' : 'N'
      }
    }

    const frame = moving ? Math.floor(this.phase / 300) % 3 : 0
    const texture = getKnightTexture(
      UNIT_COLORS[this.colorIndex], frame, this.direction,
    )
    if (this.sprite.texture !== texture) {
      this.sprite.texture = texture
    }

    const screenX = x * RENDER_TILE_SIZE
    const screenY = y * RENDER_TILE_SIZE
    const bob = Math.sin((this.phase / 200) + this.id) * BOB_AMPLITUDE

    this.sprite.x = screenX
    this.sprite.y = screenY + bob
    this.sprite.zIndex = Math.round(screenY)

    this.shadow.x = screenX
    this.shadow.y = screenY

    this.lastX = x
    this.lastY = y
  }

  destroy(): void {
    this.sprite.removeFromParent()
    this.shadow.removeFromParent()
  }
}
