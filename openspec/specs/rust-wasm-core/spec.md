# rust-wasm-core Specification

## Purpose

Rust/WASM-модуль `crates/core`: Cargo workspace, сборка в `pkg/`, API `getProgramName()` для связки TypeScript ↔ Rust.
## Requirements
### Requirement: Cargo workspace

The repository SHALL define a Cargo workspace at the repository root with `crates/core` as a workspace member.

#### Scenario: Workspace manifest exists

- **WHEN** a developer inspects the repository root
- **THEN** a `Cargo.toml` file exists with `[workspace]` listing `crates/core` as a member

### Requirement: WASM crate build

The `crates/core` crate SHALL compile to WebAssembly for the `wasm32-unknown-unknown` target and produce loadable artifacts in a `pkg/` directory at the repository root via `wasm-pack`.

#### Scenario: WASM build succeeds

- **WHEN** the user runs the project's WASM build script (`build:wasm` or equivalent documented in `package.json`)
- **THEN** the command completes with exit code 0
- **THEN** the `pkg/` directory contains JavaScript glue and a `.wasm` binary generated from `crates/core`

### Requirement: getProgramName API

The WASM module SHALL export a function named `getProgramName` that returns the string `Hello World` when invoked from JavaScript after WASM initialization.

#### Scenario: getProgramName returns greeting

- **WHEN** the WASM module is initialized and `getProgramName()` is called from JavaScript
- **THEN** the return value is the string `Hello World`

### Requirement: Workspace dependencies

The root `Cargo.toml` SHALL declare `wasm-bindgen` under `[workspace.dependencies]`, and `crates/core` SHALL reference it with `{ workspace = true }`.

#### Scenario: Shared dependency declaration

- **WHEN** a developer reads `crates/core/Cargo.toml`
- **THEN** `wasm-bindgen` is declared as a workspace dependency, not with a standalone version pin in the member crate alone

### Requirement: Dev watch for Rust sources

The project SHALL provide a development script that watches `crates/core` and rebuilds WASM on change using `cargo watch` and `wasm-pack`.

#### Scenario: Watch script documented

- **WHEN** a developer reads `package.json` scripts
- **THEN** a script exists (e.g. `dev:wasm`) that runs `cargo watch` to invoke `wasm-pack build` for `crates/core` on source changes

