## Why

Репозиторий пока содержит только инфраструктуру OpenSpec и npm-зависимости — нет исполняемого фронтенда. Минимальное hello world на Vite + React даёт проверяемую точку старта: локальный dev-сервер, сборка и видимый UI для дальнейшей разработки didactic-medieval.

## What Changes

- Добавить приложение на Vite + React (TypeScript) в корне или в отдельной папке `app/` / `web/`
- Стартовая страница с текстом «Hello World» (или эквивалент) и базовой разметкой
- npm-скрипты: `dev`, `build`, `preview`
- Обновить `.gitignore` под артефакты Vite (`dist`, кэш)
- Документировать в README или devlog, как запустить проект

## Capabilities

### New Capabilities

- `vite-react-app`: минимальный SPA на Vite + React — dev-сервер, production-сборка, hello world UI

### Modified Capabilities

- (нет существующих спецификаций в `openspec/specs/`)

## Impact

- Новые dev-зависимости: `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, типы
- Структура файлов: `index.html`, `src/`, конфиг Vite
- `package.json`: скрипты и зависимости; возможна смена `"type"` на `"module"` для ESM
- Не затрагивает существующий OpenSpec workflow
