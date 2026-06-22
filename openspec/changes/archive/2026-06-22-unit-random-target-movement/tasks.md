## 1. Rust / ECS — компоненты и система

- [x] 1.1 Добавить компоненты `Target { x, y }` и `Speed(f32)` в `crates/core/src/components.rs`
- [x] 1.2 Создать `crates/core/src/systems.rs`: функция `move_towards_target` — движение к цели, порог прибытия, назначение новой цели через RNG
- [x] 1.3 Обновить `crates/core/src/world.rs`: хранить `StdRng` в `GameWorld`, при спавне назначать `Target` и `Speed`, добавить метод `tick(delta_ms)`
- [x] 1.4 Обновить `crates/core/src/lib.rs`: подключить модуль `systems`
- [x] 1.5 Проверить `npm run build:wasm` — сборка завершается с exit code 0

## 2. Frontend — анимационный цикл

- [x] 2.1 Обновить `src/UnitsCanvas.tsx`: `requestAnimationFrame`-цикл с вызовом `world.tick(deltaMs)` и перерисовкой canvas
- [x] 2.2 Добавить cleanup: `cancelAnimationFrame` при unmount и при смене seed
- [x] 2.3 Убедиться, что кнопка «Перегенерировать» останавливает старый цикл и запускает новый

## 3. Документация и проверка

- [x] 3.1 Обновить `devlog.md`: компоненты Target/Speed, система движения, tick API, RAF-цикл
- [x] 3.2 Проверить `npm run dev`: юниты движутся по полю, при достижении цели меняют направление
- [x] 3.3 Проверить `npm run build` и `npm run preview`: production-сборка работает
