# vite-react-app Specification

## Purpose

Минимальный SPA на Vite + React: dev-сервер, production-сборка и UI, интегрированный с WASM-модулем для отображения приветствия.

## Requirements

### Requirement: Development server

The project SHALL provide a Vite development server that serves the React application with hot module replacement.

#### Scenario: Start dev server

- **WHEN** the user runs `npm run dev`
- **THEN** a local HTTP server starts and the application is reachable in the browser
- **THEN** edits to source files trigger fast refresh without a full page reload where supported

### Requirement: Production build

The project SHALL produce a static production build via Vite.

#### Scenario: Build succeeds

- **WHEN** the user runs `npm run build`
- **THEN** optimized static assets are written to a `dist` directory
- **THEN** the build completes with exit code 0

#### Scenario: Preview production build

- **WHEN** the user runs `npm run preview` after a successful build
- **THEN** the built application is served locally for verification

### Requirement: Hello World UI

The application SHALL render a visible hello world message as the primary content of the default route. The greeting text SHALL be obtained by calling `getProgramName()` from the Rust WASM module (`crates/core` / `pkg/`), not from a hardcoded string literal in React source.

#### Scenario: Default page shows greeting from WASM

- **WHEN** the user opens the application root URL in a browser after WASM has loaded
- **THEN** the page displays text containing "Hello" (case-insensitive match acceptable, e.g. "Hello World")
- **THEN** the displayed greeting matches the return value of `getProgramName()` from the WASM module

### Requirement: React root mount

The application SHALL mount a React root component into the DOM element designated in `index.html`.

#### Scenario: React renders into root

- **WHEN** the page loads
- **THEN** the `#root` (or equivalent) container is populated by React-rendered content, not empty static HTML alone

### Requirement: Frontend build info API

The application SHALL expose a `getFrontendBuildInfo()` function that returns build metadata for the frontend layer (`src/`), including `layer` (`"frontend"`) and `version` (compact UTC datetime `YYYYMMDD.HHMMSS` of the last commit touching `src/`, or `"unknown"`).

#### Scenario: Frontend build info matches git

- **WHEN** the project is a git repository with at least one commit touching `src/`
- **THEN** `getFrontendBuildInfo().version` equals the output of `TZ=UTC git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- src/`

#### Scenario: Frontend build info fallback without git

- **WHEN** git is unavailable or no commit history exists for `src/`
- **THEN** `getFrontendBuildInfo()` returns `version: "unknown"`

### Requirement: Combined build info API

The application SHALL expose a `getBuildInfo()` function that returns an object with `frontend` and `core` keys, each conforming to the build info shape (`layer`, `version`). The `core` value SHALL be obtained by parsing the JSON string returned from the WASM `getCoreBuildInfo()` function after WASM initialization.

#### Scenario: Combined build info includes both layers

- **WHEN** WASM is initialized and `getBuildInfo()` is called
- **THEN** the result contains `frontend.layer === "frontend"` and `core.layer === "core"`
- **THEN** both entries include non-empty `version` strings (which may be `"unknown"`)

### Requirement: Build version display

The application SHALL render a visible footer (or equivalent persistent UI block) showing build info for both the frontend and core layers. Each line SHALL include the layer name and version in the form `{layer}: {version}`.

#### Scenario: Footer shows frontend and core versions

- **WHEN** the user opens the application root URL in a browser after WASM has loaded
- **THEN** the page displays build info for the frontend layer
- **THEN** the page displays build info for the core layer
- **THEN** the displayed values match the output of `getBuildInfo()`
