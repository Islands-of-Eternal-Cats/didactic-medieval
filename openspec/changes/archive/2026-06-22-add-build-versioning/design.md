## Context

Монорепо Vite/React + Rust/WASM. Версии в runtime отсутствуют; `package.json` и `Cargo.toml` не отражают фактическое состояние кода в браузере. Пользователь хочет видеть «номер сборки» как компактную дату-время UTC (`YYYYMMDD.HHMMSS`) последнего коммита, затронувшего соответствующий слой (`src/` для фронта, `crates/core/` для WASM).

## Goals / Non-Goals

**Goals:**

- Git-based build info для фронтенда и WASM-ядра (отдельно по слоям)
- Runtime API: `getFrontendBuildInfo()`, `getCoreBuildInfo()`, `getBuildInfo()`
- UI-футер с версиями обоих слоёв
- Работа в `dev` и `build`
- Fallback `unknown` при недоступности git

**Non-Goals:**

- Синхронизация semver `package.json` / `Cargo.toml`
- CI badges, автоинкремент build number
- HTTP endpoint (нет серверного бэкенда)
- Git hash в UI и API

## Decisions

### 1. Источник версии — git log по path

**Решение:** для каждого слоя:

```bash
git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- <path>
```

С `TZ=UTC` для UTC. Фронт: `src/`. Core: `crates/core/` (из корня репо в Vite; из crate root в `build.rs` — `.`).

**Обоснование:** отражает «время последнего изменения кода» в слое, а не момент сборки.

**Альтернатива:** wall-clock build time — проще, но не соответствует запросу; отклонена.

### 2. Формат BuildInfo

**Решение:**

```ts
type BuildInfo = {
  layer: 'frontend' | 'core'
  version: string // YYYYMMDD.HHMMSS UTC или 'unknown'
}
```

WASM `getCoreBuildInfo()` возвращает JSON-строку с теми же полями (`layer: "core"`).

**Обоснование:** единый контракт для UI и API; без новых npm/cargo зависимостей (JSON через `format!` в Rust).

### 3. Фронтенд — Vite plugin + define

**Решение:** inline-плагин в `vite.config.ts` на хуке `config`:

- вызывает `git log` для `src/`
- прокидывает `__FRONTEND_BUILD_INFO__` через `define` как JSON-строку

Модуль `src/buildInfo.ts` парсит define и экспортирует `getFrontendBuildInfo()`.

### 4. WASM — build.rs + rustc-env

**Решение:** `crates/core/build.rs`:

```rust
println!("cargo:rustc-env=CORE_BUILD_VERSION=...");
```

`lib.rs` читает через `env!("CORE_BUILD_VERSION")` и собирает JSON в `getCoreBuildInfo()`.

### 5. Объединённый API и UI

**Решение:**

- `getBuildInfo()` в `src/buildInfo.ts` возвращает `{ frontend, core }`, где `core` парсится из `getCoreBuildInfo()` WASM
- `App.tsx`: футер под основным контентом, две строки вида `frontend: 20260622.153000`
- WASM init перед чтением core info

### 6. Fallback

**Решение:** если `git` недоступен или `git log` пуст для path — `version: 'unknown'`.

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| Shallow clone без истории для path | fallback `unknown`; документировать в `devlog.md` |
| `build.rs` требует git в PATH | та же fallback-логика; сборка не падает |
| Dev: фронт обновляется без перезапуска Vite | приемлемо — версия фронта фиксируется при старте dev-сервера |
| Расхождение фронт/core после частичного деплоя | отдельные метки по слоям — как раз цель change |

## Migration Plan

1. Добавить Vite plugin и `src/buildInfo.ts`
2. Добавить `build.rs` и `getCoreBuildInfo()` в `lib.rs`
3. Обновить `App.tsx` с футером
4. Обновить `devlog.md`
5. Проверить: `npm run build`, `npm run preview`; сверить с `git log` в формате UTC compact

Откат: удалить plugin, `buildInfo.ts`, `build.rs`, `getCoreBuildInfo`, футер в `App.tsx`.

## Open Questions

- Нет блокирующих.
