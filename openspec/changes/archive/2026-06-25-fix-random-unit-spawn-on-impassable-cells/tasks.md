## 1. TileMapResource — выбор проходимого тайла

- [x] 1.1 Добавить в `TileMapResource` метод `random_walkable_tile(&self, rng: &mut StdRng) -> (u32, u32)` с перебором случайных `(col, row)` и fallback на первый проходимый тайл
- [x] 1.2 Добавить константу `MAX_SPAWN_ATTEMPTS` (или переиспользовать существующую из `systems.rs`, если уместно)

## 2. Спавн юнитов в createGameWorld

- [x] 2.1 В `create_game_world` заменить `gen_range` по пикселям на выбор проходимого тайла через `random_walkable_tile`
- [x] 2.2 Устанавливать `Position` через `tile_to_world(col, row)` для центра тайла
- [x] 2.3 Убедиться, что порядок RNG (сначала карта, потом юниты) сохраняет детерминизм по `seed`

## 3. Проверка

- [x] 3.1 Пересобрать WASM (`npm run build:wasm`)
- [x] 3.2 Вручную проверить: при загрузке приложения юниты не рисуются на тёмных (заблокированных) тайлах
- [x] 3.3 Проверить детерминизм: два вызова `createGameWorld(50, 42)` дают идентичный `getUnitPositions()`
