## Context

Сейчас здания размещаются мгновенно: `construction_system` обрабатывает `BuildRequest` и сразу добавляет объект в `MapObjects`. Колонисты не участвуют в строительстве. Нужно ввести отложенное строительство с очередью, прогрессом и автономным назначением колонистов.

Существующая архитектура:
- `MapObjects` — `Vec<Option<ObjectKind>>` (готовые здания)
- `ObjectKind` — `Wall | Bed | Campfire`
- `BuildRequest` — событие с `col, row, kind`
- `construction_system` — синхронно добавляет объект в MapObjects
- Колонисты имеют `NeedsPlan` (еда/сон) и случайное блуждание

## Goals / Non-Goals

**Goals:**
- При получении `BuildRequest` создаётся `ConstructionSite` вместо готового здания
- `ConstructionQueue` ресурс отслеживает все активные стройки с прогрессом
- Колонисты без потребностей автоматически берут стройки и перемещаются к ним
- Прогресс строительства накапливается пропорционально числу рабочих
- При завершении стройплощадка заменяется готовым зданием
- Фронтенд рендерит стройплощадки с индикатором прогресса
- WASM API отдаёт данные о стройках

**Non-Goals:**
- Отмена стройки
- Ресурсы (дерево/камень) — только временные затраты
- Приоритеты очереди строительства
- Разные профессии колонистов

## Decisions

### 1. MapTileObject — расширенный enum для карты

Вместо `ObjectKind` напрямую, ввести новый enum `MapTileObject`:

```rust
enum MapTileObject {
    Building(ObjectKind),
    ConstructionSite(ObjectKind),
}
```

`MapObjects.tiles` меняется с `Vec<Option<ObjectKind>>` на `Vec<Option<MapTileObject>>`. Это минимальное изменение API, allowing both finished buildings and construction sites in one data structure.

**Альтернатива:** отдельная структура `ConstructionSites`. Отвергнута — дублирование логики поиска по карте (find_nearest_object и т.д.) без выгоды.

### 2. ConstructionJob — единица очереди

Новый компонент для хранения состояния стройки, но в качестве `Resource`:

```rust
#[derive(Resource)]
struct ConstructionQueue {
    jobs: Vec<ConstructionJob>,
}

struct ConstructionJob {
    col: u32,
    row: u32,
    kind: ObjectKind,
    progress: f32,
    max_progress: f32,
    assigned_units: Vec<Entity>,
}
```

**Альтернатива:** ECS-сущности для каждой стройки. Отвергнута — стройки не двигаются и не имеют поведения, проще хранить в ресурсе.

### 3. AssignedJob — компонент для колонистов

```rust
#[derive(Component)]
struct AssignedJob {
    target: (u32, u32), // col, row
}
```

Позволяет любой системе проверить, занят ли колонист стройкой. Удаляется при получении `NeedsPlan`.

### 4. Три новые системы

- **`construction_system`** — изменяется: вместо готового здания создаёт `ConstructionSite` + `ConstructionJob` (progress = 0)
- **`job_assignment_system`** — бежит по колонистам без `NeedsPlan` и `AssignedJob`, находит ближайшую стройку с местом, назначает
- **`construction_progress_system`** — каждый тик увеличивает progress для строек с рабочими, при достижении max_progress заменяет site на готовое здание

### 5. max_progress по типам

| Тип | max_progress | build_speed (1 worker) |
|-----|-------------|----------------------|
| Wall | 50 | 15/s |
| Bed | 80 | 15/s |
| Campfire | 60 | 15/s |

### 6. Рендеринг стройплощадок

Добавить слой `construction-sites` между buildings и decals, либо рендерить прямо в BuildingRenderer:
- ConstructionSite рисуется как полупрозрачная версия финального здания (alpha 0.5)
- Прогресс-бар — полоска над тайлом (Graphics rect)

### 7. WASM API

Добавить `GameWorld::get_construction_progress()` → JSON `[{col, row, progress, kind}]`.  
Доработать `GameWorld::get_map_objects()`: construction sites включаются с `kind: "ConstructionSite"` и `underlying: "Wall"`.

## Risks / Trade-offs

- **MapObjects изменение типа** → потребуется рефакторинг всех мест, где читается `map_objects.tiles[idx]`, включая `find_nearest_object`. Митигация: компилятор поймает все ошибки.
- **ConstructionQueue растёт** → при большом числе строек линейный поиск для назначения. Митигация: для текущих масштабов (десятки) не проблема.
- **deadlock по назначению** — колонист может бесконечно брать стройку, прерываться на голод, возобновлять и не успевать. Митигация: это часть симуляции, игрок наблюдает естественный процесс.
- **Колонист застрял на стройплощадке с другим юнитом** — A* pathfinding уже обрабатывает занятые клетки. overlap не критичен.
