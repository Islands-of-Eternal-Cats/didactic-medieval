## Context

Монорепо Vite/React + Rust/WASM. `GameWorld` хранит `bevy_ecs::World` с юнитами (`UnitId`, `Position`), спавнится детерминированно от `seed`. Фронт рисует статичные маркеры на canvas 800×600. Цель change — добавить движение к случайной цели через ECS-систему и анимационный цикл на фронте.

## Goals / Non-Goals

**Goals:**

- Компоненты `Target { x, y }` и `Speed(f32)` на каждом юните
- При спавне — случайная цель в границах поля, детерминированно от `seed`
- ECS-система `move_towards_target`: сдвиг `Position` к `Target` с учётом `Speed` и `delta_time`
- При достижении цели (расстояние < порог) — новая случайная цель
- WASM API `tick(deltaMs: f32)` — один шаг симуляции
- React: `requestAnimationFrame`-цикл, вызов `tick` + перерисовка canvas
- Сохранить детерминизм при одинаковом `seed` и последовательности `tick`-вызовов

**Non-Goals:**

- Коллизии, физика, обход препятствий
- Разная скорость для разных юнитов (одинаковая константа для всех)
- Визуализация целей на canvas (только движение маркеров)
- Пауза/ускорение симуляции
- Экспорт целей через WASM API (только позиции)

## Decisions

### 1. Компоненты `Target` и `Speed`

**Решение:**

```rust
#[derive(Component)]
pub struct Target { pub x: f32, pub y: f32 }

#[derive(Component)]
pub struct Speed(pub f32); // пикселей в секунду
```

**Обоснование:** минимальный набор для системы движения; `Speed` как newtype для ясности.

### 2. Система движения — обычная функция, не `Schedule`

**Решение:** функция `move_towards_target(world: &mut World, delta_secs: f32)` в `systems.rs`, вызывается из `GameWorld::tick`.

**Обоснование:** один системный шаг за тик; полный `Schedule`/`SystemSet` избыточен на данном этапе.

**Альтернатива:** `bevy_ecs::schedule::Schedule` — гибче, но over-engineering для одной системы.

### 3. Алгоритм движения

**Решение:**

1. Вычислить вектор `dir = target - position`
2. Если `|dir| < ARRIVAL_THRESHOLD` (например 2.0 px) — юнит на месте, назначить новую цель
3. Иначе: `step = min(speed * delta_secs, |dir|)`, `position += normalize(dir) * step`

**Обоснование:** простое линейное движение без overshoot; порог предотвращает дрожание у цели.

### 4. Переназначение цели

**Решение:** хранить `StdRng` в `GameWorld` (инициализируется от `seed` при создании, продолжает последовательность после спавна). При достижении цели — `rng.gen_range` для новой `Target`.

**Обоснование:** детерминизм сохраняется при одинаковом `seed` и одинаковой последовательности `tick`-вызовов.

### 5. WASM API `tick`

**Решение:**

```rust
#[wasm_bindgen(js_name = tick)]
pub fn tick(&mut self, delta_ms: f32) {
    let delta_secs = delta_ms / 1000.0;
    move_towards_target(&mut self.world, &mut self.rng, delta_secs);
}
```

**Обоснование:** фронт передаёт реальный `delta` из RAF; единицы — миллисекунды (привычно для JS).

### 6. Константы

| Параметр | Значение |
|----------|----------|
| `DEFAULT_SPEED` | 60.0 px/s |
| `ARRIVAL_THRESHOLD` | 2.0 px |
| Поле | 800 × 600 |

### 7. Анимационный цикл на фронте

**Решение:** в `UnitsCanvas` — `useEffect` с `requestAnimationFrame`:

```typescript
let lastTime = performance.now()
function frame(now: number) {
  const deltaMs = now - lastTime
  lastTime = now
  world.tick(deltaMs)
  drawUnits(ctx, parseUnitPositions(world.getUnitPositions()))
  rafId = requestAnimationFrame(frame)
}
```

Cleanup: `cancelAnimationFrame` + `world.free()`.

**Обоснование:** стандартный паттерн для canvas-анимации; `delta` из реального времени.

### 8. Структура модулей Rust

```
crates/core/src/
  lib.rs
  components.rs  — Position, UnitId, Target, Speed
  systems.rs     — move_towards_target (новый)
  world.rs       — GameWorld + rng + tick
```

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| Накопление ошибки float при длительной анимации | порог прибытия; clamp позиции в границы поля |
| Большой `delta_ms` при табе в фоне — юниты «прыгают» | cap `delta_ms` (например max 100 ms) в `tick` |
| Детерминизм ломается при разном FPS | симуляция зависит от последовательности `delta_ms`; для демо это приемлемо |
| RAF продолжается при unmount если cleanup не сработает | `cancelAnimationFrame` в return `useEffect` |

## Migration Plan

1. Добавить компоненты и систему в Rust
2. Обновить спавн и `GameWorld::tick`
3. `npm run build:wasm`
4. Обновить `UnitsCanvas` — RAF-цикл
5. Обновить `devlog.md`
6. Проверить: `npm run dev`, юниты движутся к целям

Откат: убрать `Target`, `Speed`, `systems.rs`, `tick`; вернуть статичную отрисовку.

## Open Questions

- Нет блокирующих. Конкретные значения `DEFAULT_SPEED` и `ARRIVAL_THRESHOLD` можно подкрутить при реализации.
