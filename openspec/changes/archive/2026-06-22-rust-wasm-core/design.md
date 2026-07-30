## Context

Репозиторий содержит минимальный Vite + React SPA: «Hello World» захардкожен в `src/App.tsx`. OpenSpec-спека `vite-react-app` требует видимое приветствие на главной странице. Цель change — ввести Rust/WASM как источник строки приветствия и заложить масштабируемую структуру Cargo workspace в корне.

## Goals / Non-Goals

**Goals:**

- Cargo workspace в корне с member `crates/core`
- WASM-сборка через `wasm-pack` → `pkg/`
- Экспорт `getProgramName()` → `"Hello World"`
- React отображает значение из WASM, не литерал
- Dev watch: `cargo watch` + `wasm-pack`, параллельно с Vite
- `[workspace.dependencies]` для `wasm-bindgen` с первого дня
- `npm run build` и `npm run dev` включают сборку/ watch WASM

**Non-Goals:**

- Несколько WASM-модулей или native crates
- Тесты Rust, CI pipeline, оптимизация размера WASM
- SSR, monorepo с отдельным npm-пакетом
- HMR для Rust (достаточно пересборки `pkg/` и reload страницы)

## Decisions

### 1. Cargo workspace в корне, crate `crates/core`

**Решение:** корневой `Cargo.toml` с `[workspace] members = ["crates/core"]`; crate name — `core`.

**Обоснование:** масштабируется на дополнительные members (`crates/cli`, `crates/shared`) без миграции layout.

**Альтернатива:** одиночный crate в `wasm/` — проще, но хуже для роста; отклонена.

### 2. Сборка: wasm-pack, target bundler

**Решение:**

```bash
wasm-pack build crates/core --target bundler --out-dir pkg
```

**Обоснование:** `bundler` ориентирован на Vite/webpack; ES-модуль в `pkg/` с `init()` и именованными экспортами.

**Альтернатива:** `--target web` — работает, но `bundler` ближе к npm-сборщикам.

### 3. Зависимости workspace

**Решение:** в корневом `Cargo.toml`:

```toml
[workspace.dependencies]
wasm-bindgen = "0.2"
```

Member `crates/core/Cargo.toml` использует `wasm-bindgen = { workspace = true }`.

### 4. Rust API и JS-имя

**Решение:**

```rust
#[wasm_bindgen(js_name = getProgramName)]
pub fn get_program_name() -> String {
    "Hello World".into()
}
```

**Обоснование:** camelCase в JS по контракту; snake_case в Rust по convention.

### 5. Dev workflow

**Решение:**

| Скрипт | Действие |
|--------|----------|
| `build:wasm` | однократная сборка WASM в `pkg/` |
| `dev:wasm` | `cargo watch -w crates/core -s 'wasm-pack build crates/core --target bundler --out-dir pkg'` |
| `dev` | `build:wasm` затем `concurrently "dev:wasm" "vite"` |
| `build` | `build:wasm && tsc -b && vite build` |

**Обоснование:** watch пересобирает WASM при изменении Rust; Vite обслуживает React; `concurrently` держит оба процесса.

### 6. React: async init

**Решение:** `useEffect` + `useState`: `await init()` из `pkg/core`, затем `getProgramName()`. До загрузки WASM — пустой или минимальный placeholder (например, пустой `<h1>` или без текста).

**Обоснование:** WASM загружается асинхронно; top-level await возможен, но `useEffect` проще для одного компонента.

### 7. Gitignore и артефакты

**Решение:** игнорировать `pkg/` и `target/`; не коммитить WASM glue и `.wasm` binary.

## Risks / Trade-offs

| Риск | Митигация |
|------|-----------|
| Rust/wasm-pack не установлены у разработчика | Запись в `devlog.md`: `rustup target add wasm32-unknown-unknown`, `cargo install wasm-pack cargo-watch` |
| `pkg/` отсутствует до первой сборки | `dev` и `build` вызывают `build:wasm` первым шагом |
| Изменения Rust не HMR | `cargo watch` пересобирает; пользователь обновляет страницу |
| CI без Rust | вне scope; добавить позже при появлении CI |
| Импорт `pkg/core` без типов TypeScript | при необходимости `vite-env.d.ts` или локальный `.d.ts`; wasm-pack может генерировать типы |

## Migration Plan

1. Добавить `Cargo.toml`, `crates/core/`
2. Установить toolchain, выполнить `npm run build:wasm`
3. Обновить `App.tsx`, `package.json`, `.gitignore`
4. Проверить: `npm run dev`, `npm run build`, `npm run preview`
5. Обновить `devlog.md`

Откат: удалить Rust-файлы, `pkg/`, вернуть hardcoded Hello World в `App.tsx`, откатить scripts в `package.json`.

## Open Questions

- Нет блокирующих; placeholder при загрузке WASM можно уточнить при реализации (пустой h1 vs «Loading…»).
