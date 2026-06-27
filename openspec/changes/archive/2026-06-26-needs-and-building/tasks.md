## 1. ECS: компоненты и ресурсы

- [x] 1.1 Добавить компоненты `Satiation(f32)`, `Energy(f32)`, `NeedsPlan { kind: NeedKind, target: (f32,f32) }`, `HungryDebuff`, `TiredDebuff` в `components.rs`
- [x] 1.2 Добавить enum `NeedKind { Eat, Sleep }` в `components.rs`
- [x] 1.3 Добавить ресурс `MapObjects { tiles: Vec<Option<ObjectKind>> }` и enum `ObjectKind { Wall, Bed, Campfire }` с методом `service_radius()` в `resources.rs`

## 2. ECS: события

- [x] 2.1 Добавить сообщения `Hungry(Entity)`, `Tired(Entity)`, `Sated(Entity)`, `Rested(Entity)` в `events.rs`
- [x] 2.2 Добавить сообщение `BuildRequest { col: u32, row: u32, kind: ObjectKind }` в `events.rs`

## 3. ECS: системы потребностей

- [x] 3.1 Реализовать `needs_accrual` — уменьшает `Satiation` и `Energy` всех юнитов со скоростью 0.8/сек и 0.4/сек соответственно
- [x] 3.2 Реализовать `needs_event_check` — проверяет пороги (<30, >90) и эмитит события `Hungry`/`Tired`/`Sated`/`Rested`, управляет дебаффами
- [x] 3.3 Реализовать `needs_decision` — читает события, ищет ближайший `Campfire`/`Bed` через `MapObjects` (линейный скан), создаёт/удаляет `NeedsPlan`
- [x] 3.4 Реализовать `execute_needs_plan` — если у юнита есть `NeedsPlan`: далеко от цели → ставит A* путь; у цели → восполняет потребность (Eat: 15/сек, Sleep: 7/сек)

## 4. ECS: система строительства

- [x] 4.1 Реализовать `construction_system` — читает `BuildRequest`, проверяет границы карты, walkable, занятость тайла; применяет изменения (блокировка `TileMapResource` для стен, установка `MapObjects`)
- [x] 4.2 Модифицировать `find_path_action` — пропускать поиск случайной цели, если у юнита есть `NeedsPlan`

## 5. ECS: Schedule и World

- [x] 5.1 Обновить `create_game_world` — инициализировать `Messages` для всех новых событий, вставить `MapObjects`, добавить `Satiation(100)` и `Energy(100)` каждому юниту
- [x] 5.2 Обновить `tick()` — вызвать `.update()` для всех новых `Messages`
- [x] 5.3 Настроить `Schedule` с правильным порядком: `needs_accrual → needs_event_check → needs_decision → execute_needs_plan → (find_path_action, construction_system).parallel() → move_along_path`

## 6. WASM API (JS-мост)

- [x] 6.1 Реализовать `get_unit_states()` — возвращает JSON с satiation, energy, hungry, tired, needsPlan для каждого юнита
- [x] 6.2 Реализовать `build(col, row, kind)` — создаёт `BuildRequest` в ECS через `MessageWriter`
- [x] 6.3 Реализовать `get_map_objects()` — возвращает JSON всех построек на карте

## 7. Фронтенд: рендеринг построек

- [x] 7.1 Добавить слой `buildings` в `SceneRenderer` (порядок: terrain → buildings → decals → units → overlay)
- [x] 7.2 Реализовать рендеринг построек: после каждого `tick()` синхронизировать спрайты с `getMapObjects()` (стена — серый 32×32, кровать — коричневый 16×16, костёр — анимированный 2 кадра)
- [x] 7.3 Реализовать иконки статусов над юнитами: жёлтая иконка для голода, синяя для усталости, обе рядом если активны оба дебаффа

## 8. Фронтенд: UI строительства

- [x] 8.1 Создать компонент `BuildToolbar` с кнопками для трёх типов построек (стена, кровать, костёр) и отменой (Esc/ПКМ)
- [x] 8.2 Добавить `BuildToolbar` в `App.tsx`, передавать `buildMode` в `UnitsCanvas`
- [x] 8.3 В `UnitsCanvas.tsx` обрабатывать клик по тайлу: переводить координаты мыши в (col, row) и вызывать `world.build(col, row, buildMode)`
