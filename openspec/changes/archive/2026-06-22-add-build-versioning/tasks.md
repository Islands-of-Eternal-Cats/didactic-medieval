## 1. Frontend build info

- [x] 1.1 Добавить Vite plugin в `vite.config.ts`: `git log -1` для `src/`, inject `__FRONTEND_BUILD_INFO__` через `define`
- [x] 1.2 Создать `src/buildInfo.ts`: тип `BuildInfo`, `getFrontendBuildInfo()` с парсингом define и fallback `unknown`
- [x] 1.3 Добавить `getBuildInfo()` в `src/buildInfo.ts`: объединяет frontend + core (парсинг JSON из WASM `getCoreBuildInfo()`)

## 2. WASM core build info

- [x] 2.1 Создать `crates/core/build.rs`: `git log -1` для crate path, `cargo:rustc-env` для `CORE_BUILD_VERSION`, fallback `unknown`
- [x] 2.2 Добавить `getCoreBuildInfo()` в `crates/core/src/lib.rs`: JSON-строка из `env!` макроса

## 3. UI

- [x] 3.1 Обновить `src/App.tsx`: инициализация WASM, футер с build info обоих слоёв из `getBuildInfo()`
- [x] 3.2 Добавить минимальные стили футера в `src/App.css` (если нужно для читаемости)

## 4. Документация и проверка

- [x] 4.1 Обновить `devlog.md`: описание build info, команды `git log` для сверки
- [x] 4.2 Проверить `npm run build` и `npm run preview`: футер виден, значения совпадают с `git log` в формате UTC compact
