## Context

Монорепо Vite/React + Rust/WASM. `crates/core` экспортирует `getProgramName()` и `getCoreBuildInfo()`; фронт отображает приветствие и build info. Цель change — ввести `bevy_ecs` как игровое ядро, спавнить юниты со случайными позициями и визуализировать их на canvas в React.

## Goals / Non-Goals

**Goals:**

- `bevy_ecs::World` в `crates/core` как источник истины для юнитов
- Компонент `Position { x, y }`, спавн N юнитов при создании мира
- Seed-based PRNG для детерминированных позиций при одинаковом seed
- WASM API: `createGameWorld(unitCount, seed)` и `getUnitPositions()` → JSON
- React: `<canvas>` 800×600, отрисовка маркеров, кнопка «перегенерировать» с новым seed
- Сохранить `getProgramName()` и `getCoreBuildInfo()` без изменений

**Non-Goals:**

- Полный Bevy (рендер, assets, ввод, game loop)
- Физика, коллизии, AI, движение юнитов
- HTML/SVG-маркеры (только canvas)
- Сохранение мира между перезагрузками страницы
- Оптимизация размера WASM (замер — да, агрессивная оптимизация — нет)

## Decisions

### 1. Только `bevy_ecs`, не весь Bevy

**Решение:** добавить `bevy_ecs` в `[workspace.dependencies]` и `crates/core`; без `bevy`, `bevy_render` и прочих crate'ов движка.

**Обоснование:** нужна только ECS-модель данных; рендер — на фронте.

**Альтернатива:** свой минимальный ECS — проще по зависимостям, но не соответствует запросу; отклонена.

### 2. Состояние мира — `#[wasm_bindgen]` struct

**Решение:**

```rust
#[wasm_bindgen]
pub struct GameWorld {
    world: World,
}

#[wasm_bindgen(js_name = createGameWorld)]
pub fn create_game_world(unit_count: u32, seed: u64) -> GameWorld { ... }

#[wasm_bindgen(js_name = getUnitPositions)]
pub fn get_unit_positions(&self) -> String { ... }
```

**Обоснование:** `World` нельзя экспортировать напрямую; handle позволяет пересоздавать мир при смене seed.

### 3. Компонент и спавн

**Решение:**

```rust
#[derive(Component)]
struct Position { x: f32, y: f32 }
```

При `createGameWorld(count, seed)` — спавн `count` сущностей с `Position` в диапазоне `[0, FIELD_WIDTH)` × `[0, FIELD_HEIGHT)` (800×600).

**Обоснование:** простой контракт; координаты совпадают с логическим размером canvas.

### 4. Случайность — seed-based `StdRng`

**Решение:** `rand` + `StdRng::seed_from_u64(seed)`; без `getrandom`/js feature.

**Обоснование:** детерминизм для тестов и отладки; не нужны системные источники энтропии в WASM.

**Альтернатива:** `js_sys::Math::random()` — недетерминированно; отклонена.

### 5. JSON-контракт позиций

**Решение:**

```json
[{ "id": 0, "x": 42.5, "y": 17.3 }, ...]
```

`id` — порядковый индекс при спавне (0..count-1). Сборка через `format!` в Rust, без `serde`.

**Обоснование:** согласовано с существующим подходом (`getCoreBuildInfo` через `format!`).

### 6. Отрисовка — HTML `<canvas>`

**Решение:** компонент `UnitsCanvas` (или inline в `App.tsx`):

- canvas 800×600 CSS-пикселей
- `useRef` + `getContext('2d')`
- при монтировании: `createGameWorld(50, seed)` → `getUnitPositions()` → `arc()` для каждого юнита
- кнопка «Перегенерировать»: новый `seed` (например `Date.now()`), пересоздание `GameWorld`, `clearRect` + redraw
- опционально: учёт `devicePixelRatio` для чёткости

**Обоснование:** пользователь выбрал canvas; масштабируется на N юнитов без лишних DOM-узлов.

### 7. Значения по умолчанию

| Параметр | Значение |
|----------|----------|
| `unit_count` | 50 |
| Поле | 800 × 600 |
| Радиус маркера | 4 px |
| Начальный seed | `Date.now()` при первом рендере |

### 8. Структура модулей Rust

**Решение:**

```
crates/core/src/
  lib.rs       — wasm_bindgen exports
  world.rs     — GameWorld, create/spawn
  components.rs — Position
```

**Обоснование:** минимальное разделение; не over-engineer.

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| `bevy_ecs` увеличивает размер WASM и время сборки | зафиксировать версию; замерить `pkg/` после первой сборки; `default-features = false` где применимо |
| Несовместимость `bevy_ecs` с `wasm32-unknown-unknown` | проверить на этапе `build:wasm`; при блокере — задокументировать минимальную рабочую версию |
| Парсинг JSON на фронте без типов | локальный TS-тип `UnitPosition`; валидация длины массива |
| `GameWorld` не освобождается явно | при перегенерации заменять ссылку; WASM GC подберёт старый handle |

## Migration Plan

1. Добавить зависимости в `Cargo.toml` и `crates/core/Cargo.toml`
2. Реализовать ECS-модули и WASM API
3. `npm run build:wasm` — убедиться в успешной сборке
4. Добавить canvas-компонент и интеграцию в `App.tsx`
5. Обновить `devlog.md`
6. Проверить: `npm run dev`, `npm run build`, ручная проверка в браузере

Откат: удалить ECS-модули и зависимости, убрать canvas из `App.tsx`, вернуть UI к greeting + build info.

## Open Questions

- Нет блокирующих. Точную версию `bevy_ecs` выбрать при реализации по результату `cargo build`.
