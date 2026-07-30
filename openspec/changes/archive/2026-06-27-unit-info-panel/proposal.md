## Why

Сейчас нет обратной связи по состоянию юнитов — нельзя понять, что именно делает колонист, насколько он голоден или устал. Это делает симуляцию непрозрачной.

## What Changes

- Rust: обогатить `getUnitStates()` полями `speed` и `assignedJob`
- Frontend: хит-тест по клику на canvas → выбор юнита → панель в правом верхнем углу с ID, прогресс-барами сытости/энергии, статусом, скоростью, кнопкой ×
- Снятие выделения: клик в пустоту, Esc, кнопка ×

## Capabilities

### New Capabilities
- `unit-selection`: выбор юнита кликом, визуальная обратная связь
- `unit-info-panel`: панель с детальным состоянием выбранного юнита

### Modified Capabilities
- `getUnitStates()` — расширенный JSON

## Impact

- `crates/core/src/world.rs` — расширение `get_unit_states()`
- `src/App.tsx` — состояние `selectedUnitId`, рендер `UnitPanel`
- `src/UnitsCanvas.tsx` — hit-test клика по юнитам
- `src/UnitPanel.tsx` — новый компонент
- `src/App.css` — стили панели
