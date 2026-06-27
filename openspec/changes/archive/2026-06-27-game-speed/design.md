## Context

The app uses an ECS simulation (Rust/WASM) driven by a PIXI.js ticker. Currently `world.tick(ticker.deltaMS)` runs at a fixed speed. We need to add user-controllable speed (pause, x1, x5, x10) with keyboard and UI control.

## Goals / Non-Goals

**Goals:**
- Expose `gameSpeed` state at the App level, passed down to `UnitsCanvas`
- Keyboard shortcuts (Space, 1, 2, 3) toggle speed; Space uses `preventDefault`
- UI buttons below build toolbar reflect and control speed
- Simulation delta multiplied by speed; at 0 (pause) tick is skipped
- Rust-side `MAX_DELTA_MS` raised from 100→200 to avoid capping x10

**Non-Goals:**
- No changes to rendering logic or frame rate
- No changes to audio or other systems

## Decisions

1. **State in App.tsx** — `gameSpeed` lives in App alongside other top-level state. Passed as prop to `UnitsCanvas`. Keeps state management simple without a store.
2. **Window event listener** — Keyboard handler added via `window.addEventListener('keydown')` next to the existing Escape handler. Space calls `e.preventDefault()`.
3. **New SpeedControls component** — Renders a simple button row. Receives `gameSpeed` and `setGameSpeed` as props. Active button gets a CSS class for highlighting.
4. **Delta multiplication logic** — In `UnitsCanvas` ticker callback: if `gameSpeed === 0`, return early (skip tick); else call `world.tick(deltaMS * gameSpeed)`.

## Risks / Trade-offs

- **Keyboard conflicts**: Space is also used for scrolling. `preventDefault` on the keydown handler prevents this.
- **Performance at x10**: At 60fps x10, `deltaMS` becomes ~167ms. Raising `MAX_DELTA_MS` to 200 handles this, but physics precision could degrade at high deltas. Acceptable for a game at this scale.
