## Context

Монорепо Vite/React + Rust/WASM. `GameWorld` хранит `bevy_ecs::World` с юнитами (`UnitId`, `Position`, `Target`, `Speed`). Система `move_towards_target` — обычная функция, вызываемая из `tick`; при достижении цели сразу назначает новую через `StdRng` в `GameWorld`. Фронт рисует юнитов на canvas в RAF-цикле.

## Goals / Non-Goals

**Goals:**

- Событие `TargetReached { entity }` в ECS event bus (`Events<TargetReached>`)
- Система `move_towards_target` — только движение; при arrival отправляет событие
- Система `assign_random_target` — читает события, назначает новую случайную цель
- `Schedule` в `GameWorld::tick` с явным порядком: move → assign → flush events
- Ресурсы `SimulationRng` и `DeltaTime` в world
- Сохранить детерминизм и внешнее поведение (WASM API без изменений)

**Non-Goals:**

- Observers, `EventRegistry`, `event_update_system`
- Экспорт событий в JS
- Изменения фронтенда
- Коллизии, AI, разная скорость юнитов

## Decisions

### 1. Событие `TargetReached`

```rust
#[derive(Event)]
pub struct TargetReached {
    pub entity: Entity,
}
```

**Обоснование:** минимальный payload; `Entity` достаточно для доступа к `Target` в assign-системе.

### 2. Ресурсы

| Ресурс | Назначение |
|--------|------------|
| `SimulationRng(StdRng)` | Детерминированный RNG (перенос из `GameWorld.rng`) |
| `DeltaTime(f32)` | `delta_secs` на текущий тик |
| `Events<TargetReached>` | Event bus |

**Обоснование:** ECS-системы получают RNG и delta через `Res`/`ResMut`, без глобального состояния в `GameWorld`.

### 3. Две системы вместо одной функции

**`move_towards_target`:** `Query<(Entity, &mut Position, &Target, &Speed)>`, `EventWriter<TargetReached>`, `Res<DeltaTime>`. При `dist < ARRIVAL_THRESHOLD` — `writer.send(...)`, иначе сдвиг `Position`.

**`assign_random_target`:** `EventReader<TargetReached>`, `Query<&mut Target>`, `ResMut<SimulationRng>`. Для каждого события — `*target = random_target(&mut rng.0)`.

**Альтернатива:** оставить одну функцию с `world.send_event` / `EventCursor` — проще, но не идиоматично для ECS.

### 4. Schedule в `GameWorld`

```rust
schedule.add_systems((
    move_towards_target,
    assign_random_target.after(move_towards_target),
));
// tick:
world.insert_resource(DeltaTime(delta_secs));
schedule.run(&mut world);
world.resource_mut::<Events<TargetReached>>().update();
```

**Обоснование:** две системы + event bus оправдывают Schedule; явный порядок через `.after()`.

**Альтернатива (отклонена ранее):** Schedule для одной системы — over-engineering; сейчас две системы — уместно.

### 5. Flush events вручную

В конце `tick` — `Events<TargetReached>::update()`, без `EventRegistry`.

**Обоснование:** один тип события; `event_update_system` избыточен.

### 6. Структура модулей

```
crates/core/src/
  lib.rs
  components.rs  — Position, UnitId, Target, Speed
  events.rs      — TargetReached (новый)
  resources.rs   — SimulationRng, DeltaTime (новый)
  systems.rs     — move_towards_target, assign_random_target
  world.rs       — GameWorld + Schedule + tick
```

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| Забыть `events.update()` — утечка / повторное чтение | явный вызов в конце `tick` |
| Entity despawned до assign | `get_mut` с `if let Ok(...)` — игнорировать |
| RNG sequence сдвигается vs inline | порядок назначения = порядок query; эквивалентно текущему |
| Schedule overhead в WASM | минимальный; один `run` за тик |

## Migration Plan

1. Добавить `events.rs`, `resources.rs`
2. Разделить системы, добавить Schedule
3. `npm run build:wasm`
4. Проверить движение и детерминизм
5. Обновить `devlog.md`

Откат: вернуть монолитную `move_towards_target` и `GameWorld.rng`.

## Open Questions

- Нет блокирующих.
