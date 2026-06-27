## 1. Rust: расширить getUnitStates()

- [x] 1.1 Добавить поле `speed` в JSON ответа `get_unit_states()`
- [x] 1.2 Добавить поле `assignedJob` в JSON ответа `get_unit_states()`: при наличии `AssignedJob` у юнита искать соответствующий `ConstructionJob` в `ConstructionQueue`

## 2. Фронтенд: состояние выбора юнита

- [x] 2.1 Добавить состояние `selectedUnitId` в `App.tsx`, передавать его и сеттер в `UnitsCanvas`
- [x] 2.2 В `UnitsCanvas.tsx`: реализовать hit-test по юнитам при клике (20px радиус)
- [x] 2.3 Обработка снятия выделения: клик в пустоту, Esc (добавить в handleKeyDown в App.tsx)

## 3. Фронтенд: панель информации

- [x] 3.1 Создать компонент `UnitPanel.tsx` — принимает `unitStates` и `selectedUnitId`, отображает панель в правом верхнем углу с полупрозрачным фоном и кнопкой ×
- [x] 3.2 Добавить стили для `UnitPanel` в `App.css`
- [x] 3.3 Подключить `UnitPanel` в `App.tsx`, передавать данные из `getUnitStates()`
