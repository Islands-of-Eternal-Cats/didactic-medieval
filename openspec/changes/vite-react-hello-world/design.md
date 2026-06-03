## Context

Репозиторий `didactic-medieval` — зелёное поле: `package.json` с OpenSpec, без фронтенда. Нужен минимальный, стандартный стек Vite + React для последующих фич. Предпочтение — официальный шаблон Vite (`react-ts`), без лишних библиотек.

## Goals / Non-Goals

**Goals:**

- Рабочий dev-сервер и production-сборка
- Один экран с приветствием Hello World
- TypeScript + React 18+ (или актуальная стабильная версия из шаблона)
- npm-скрипты `dev`, `build`, `preview`
- `.gitignore` покрывает `dist` и кэш Vite

**Non-Goals:**

- Роутинг (React Router), state management, UI-kit
- Тесты, CI, деплой
- SSR, monorepo, отдельный пакет в подпапке без необходимости
- Интеграция с OpenSpec в runtime

## Decisions

### 1. Структура: корень репозитория vs подпапка

**Решение:** инициализировать Vite в **корне репозитория** (`index.html`, `src/`, `vite.config.ts`).

**Обоснование:** один `package.json`, проще для hello world; OpenSpec остаётся в `openspec/`, не конфликтует.

**Альтернатива:** `web/` — отложена до роста монорепо.

### 2. Шаблон и язык

**Решение:** `npm create vite@latest . -- --template react-ts` (или эквивалентные файлы вручную при неинтерактивном сценарии).

**Обоснование:** официальный минимум, TypeScript по умолчанию.

### 3. package.json type

**Решение:** `"type": "module"` для ESM, как у Vite.

**Обоснование:** Vite и конфиг ожидают ESM; текущий `"commonjs"` заменить.

### 4. Hello World реализация

**Решение:** компонент `App.tsx` с заголовком `<h1>Hello World</h1>` (опционально подзаголовок с именем проекта).

**Обоснование:** соответствует спеке, без лишней логики.

### 5. Стили

**Решение:** оставить дефолтный `index.css` / `App.css` из шаблона или минимальный сброс; не добавлять Tailwind/CSS-in-JS.

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| Конфликт с существующим `package.json` (commonjs, scripts) | Слить скрипты Vite с сохранением `init` для OpenSpec |
| `npm create` в непустой директории | Создать файлы вручную по шаблону или `--force` только если безопасно |
| Версии React/Vite устареют | Зафиксировать в lockfile при установке |

## Migration Plan

1. Добавить зависимости и конфиг Vite + React
2. Добавить `src/`, `index.html`, обновить scripts
3. Обновить `.gitignore`
4. Проверить: `npm run dev`, `npm run build`, `npm run preview`
5. Краткая запись в `devlog.md` (команды запуска)

Откат: удалить добавленные файлы фронтенда и вернуть прежний `package.json` из git.

## Open Questions

- Нет блокирующих; имя бренда в UI можно уточнить позже (сейчас «Hello World» достаточно).
