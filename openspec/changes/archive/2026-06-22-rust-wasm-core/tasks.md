## 1. Cargo workspace и Rust crate

- [x] 1.1 Создать корневой `Cargo.toml` с `[workspace]`, `members = ["crates/core"]`, `resolver = "2"` и `[workspace.dependencies] wasm-bindgen = "0.2"`
- [x] 1.2 Создать `crates/core/Cargo.toml` (package name `core`, `crate-type = ["cdylib", "rlib"]`, `wasm-bindgen = { workspace = true }`)
- [x] 1.3 Реализовать `crates/core/src/lib.rs` с `#[wasm_bindgen(js_name = getProgramName)] pub fn get_program_name() -> String` возвращающим `"Hello World"`

## 2. Сборка WASM и npm-скрипты

- [x] 2.1 Добавить в `.gitignore` записи `pkg/` и `target/`
- [x] 2.2 Добавить dev-зависимость `concurrently` в `package.json`
- [x] 2.3 Добавить скрипты: `build:wasm`, `dev:wasm` (`cargo watch -w crates/core -s 'wasm-pack build crates/core --target bundler --out-dir pkg'`), обновить `dev` и `build`
- [x] 2.4 Выполнить `npm run build:wasm` и убедиться, что `pkg/` создаётся без ошибок

## 3. Интеграция с React

- [x] 3.1 Обновить `src/App.tsx`: async init WASM из `pkg/core`, вызов `getProgramName()`, отображение результата в `<h1>` вместо hardcoded строки
- [x] 3.2 При необходимости добавить TypeScript-декларации для импорта из `pkg/core`

## 4. Проверка и документация

- [x] 4.1 Проверить `npm run dev` — страница показывает «Hello World» из WASM
- [x] 4.2 Проверить `npm run build` и `npm run preview` — production-сборка работает
- [x] 4.3 Обновить `devlog.md`: toolchain (`rustup target add wasm32-unknown-unknown`, `cargo install wasm-pack cargo-watch`) и команды запуска
