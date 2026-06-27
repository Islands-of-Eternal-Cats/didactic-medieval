## Why

The simulation currently runs at a fixed speed, making it tedious to watch long-term behaviour or to inspect the state closely. Adding variable speed controls (including pause) lets players observe tactical situations at their own pace and fast-forward through uneventful periods.

## What Changes

- Add `gameSpeed` state to App (0=pause, 1, 5, 10; default 1)
- Keyboard shortcuts: Space (toggle pause), 1/2/3 for x1/x5/x10
- Speed control buttons below the build toolbar (⏸ Пауза, x1, x5, x10)
- Simulation delta is multiplied by `gameSpeed`; at 0 the tick is skipped
- Rust-side `MAX_DELTA_MS` increased from 100 to 200

## Capabilities

### New Capabilities
- `game-speed`: Simulation speed controls with pause, 3 speed levels, keyboard shortcuts, and UI buttons

### Modified Capabilities
*(none — no existing specs have requirement changes)*

## Impact

- `src/App.tsx` — gameSpeed state, keyboard handler
- `src/UnitsCanvas.tsx` — accept gameSpeed prop, multiply delta
- `src/SpeedControls.tsx` — new component
- `src/App.css` — styles for speed buttons
- `crates/game_core/src/systems.rs` — MAX_DELTA_MS constant
