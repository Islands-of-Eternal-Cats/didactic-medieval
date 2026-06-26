import { Application, Container } from 'pixi.js'

export const LOGICAL_TILE_SIZE = 16
export const RENDER_TILE_SIZE = 32
export const COLS = 25
export const ROWS = 19
export const SCENE_WIDTH = COLS * RENDER_TILE_SIZE
export const SCENE_HEIGHT = ROWS * RENDER_TILE_SIZE

export type SceneLayers = {
  terrain: Container
  buildings: Container
  decals: Container
  units: Container
  overlay: Container
}

export class SceneRenderer {
  readonly app: Application
  readonly layers: SceneLayers
  private readonly root: Container
  private initialized = false

  constructor() {
    this.app = new Application()
    this.root = new Container()
    this.layers = {
      terrain: new Container(),
      buildings: new Container(),
      decals: new Container(),
      units: new Container(),
      overlay: new Container(),
    }
    this.layers.units.sortableChildren = true
    this.root.addChild(
      this.layers.terrain,
      this.layers.buildings,
      this.layers.decals,
      this.layers.units,
      this.layers.overlay,
    )
  }

  async init(parent: HTMLElement): Promise<void> {
    await this.app.init({
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      antialias: false,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      background: 0x1a1a1a,
      roundPixels: true,
    })
    this.app.stage.addChild(this.root)
    parent.appendChild(this.app.canvas)
    this.app.canvas.style.width = `${SCENE_WIDTH}px`
    this.app.canvas.style.height = `${SCENE_HEIGHT}px`
    this.app.canvas.style.imageRendering = 'pixelated'
    this.initialized = true
  }

  destroy(): void {
    if (!this.initialized) return
    this.initialized = false
    this.app.destroy(true, { children: true, texture: true })
  }
}
