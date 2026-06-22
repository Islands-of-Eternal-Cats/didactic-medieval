## ADDED Requirements

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
