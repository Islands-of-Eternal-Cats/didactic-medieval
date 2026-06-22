## 1. ECS events and resources

- [x] 1.1 Добавить `events.rs` с `TargetReached { entity: Entity }`
- [x] 1.2 Добавить `resources.rs` с `SimulationRng(StdRng)` и `DeltaTime(f32)`
- [x] 1.3 Зарегистрировать модули в `lib.rs`

## 2. Systems refactor

- [x] 2.1 Переписать `move_towards_target` как ECS-систему с `EventWriter<TargetReached>`
- [x] 2.2 Добавить `assign_random_target` с `EventReader<TargetReached>`

## 3. GameWorld and Schedule

- [x] 3.1 Добавить `Schedule` в `GameWorld`, инициализировать events/resources при создании
- [x] 3.2 Обновить `tick`: `DeltaTime` → `schedule.run` → `events.update()`
- [x] 3.3 Убрать поле `rng` из `GameWorld` (перенести в `SimulationRng` resource)

## 4. Verification

- [x] 4.1 `npm run build:wasm` — сборка без ошибок
- [x] 4.2 Обновить `devlog.md`
