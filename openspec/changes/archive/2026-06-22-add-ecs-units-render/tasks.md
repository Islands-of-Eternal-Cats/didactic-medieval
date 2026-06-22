## 1. Rust / ECS core

- [x] 1.1 Добавить `bevy_ecs` и `rand` в `[workspace.dependencies]` корневого `Cargo.toml` и в `crates/core/Cargo.toml`
- [x] 1.2 Создать `crates/core/src/components.rs` с компонентом `Position { x, y }`
- [x] 1.3 Создать `crates/core/src/world.rs`: `GameWorld`, спавн юнитов через `StdRng::seed_from_u64`, константы поля 800×600
- [x] 1.4 Обновить `crates/core/src/lib.rs`: экспорт `createGameWorld` и `getUnitPositions`, подключить модули
- [x] 1.5 Проверить `npm run build:wasm` — сборка завершается с exit code 0

## 2. Frontend canvas

- [x] 2.1 Создать компонент canvas-отрисовки (например `src/UnitsCanvas.tsx`): ref, 800×600, `arc()` для маркеров
- [x] 2.2 Интегрировать в `src/App.tsx`: вызов `createGameWorld(50, seed)`, парсинг JSON из `getUnitPositions()`
- [x] 2.3 Добавить кнопку «Перегенерировать»: новый seed, пересоздание мира, `clearRect` + redraw
- [x] 2.4 Добавить минимальные стили canvas и кнопки в `src/App.css`

## 3. Документация и проверка

- [x] 3.1 Обновить `devlog.md`: зависимости ECS, WASM API, canvas-отрисовка
- [x] 3.2 Проверить `npm run dev`: canvas с 50 юнитами, перегенерация меняет позиции
- [x] 3.3 Проверить `npm run build` и `npm run preview`: production-сборка работает
