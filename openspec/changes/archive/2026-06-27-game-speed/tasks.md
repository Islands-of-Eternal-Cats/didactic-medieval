## 1. Rust-side: MAX_DELTA_MS

- [x] 1.1 Increase `MAX_DELTA_MS` from `100.0` to `200.0` in `crates/game_core/src/systems.rs`

## 2. App.tsx: gameSpeed state and keyboard handler

- [x] 2.1 Add `gameSpeed` state with type `number`, default `1`, valid values `0 | 1 | 5 | 10`
- [x] 2.2 Add `prevSpeed` ref to track the last non-zero speed for Space toggle
- [x] 2.3 Extend `handleKeyDown` to handle `Space` (toggle pause with `e.preventDefault()`), `1` (x1), `2` (x5), `3` (x10)
- [x] 2.4 Pass `gameSpeed` prop to `<UnitsCanvas>`
- [x] 2.5 Add `<SpeedControls gameSpeed={gameSpeed} onChange={setGameSpeed} />` below `<BuildToolbar>`

## 3. UnitsCanvas.tsx: Accept gameSpeed prop

- [x] 3.1 Add `gameSpeed: number` to `UnitsCanvasProps`
- [x] 3.2 Destructure `gameSpeed` from props
- [x] 3.3 In ticker callback: if `gameSpeed === 0` skip `world.tick()`; else call `world.tick(ticker.deltaMS * gameSpeed)`

## 4. SpeedControls.tsx: New component

- [x] 4.1 Create `src/SpeedControls.tsx` with props `gameSpeed: number` and `onChange: (speed: number) => void`
- [x] 4.2 Render buttons: ⏸ Пауза, x1, x5, x10
- [x] 4.3 Apply `active` CSS class to the button matching `gameSpeed`
- [x] 4.4 Call `onChange` on button click with the corresponding speed value

## 5. App.css: Speed control styles

- [x] 5.1 Add `.speed-controls` flex container style
- [x] 5.2 Add `.speed-controls button` base button style
- [x] 5.3 Add `.speed-controls button.active` highlight style
