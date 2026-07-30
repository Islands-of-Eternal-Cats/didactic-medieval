## ADDED Requirements

### Requirement: getCoreBuildInfo API

The WASM module SHALL export a function named `getCoreBuildInfo` that returns a JSON string with fields `layer` (`"core"`) and `version` (compact UTC datetime `YYYYMMDD.HHMMSS` of the last commit touching `crates/core/`, or `"unknown"`). Values SHALL be determined at WASM compile time via `build.rs` and embedded with `env!`.

#### Scenario: getCoreBuildInfo matches git

- **WHEN** the project is a git repository with at least one commit touching `crates/core/`
- **AND** WASM is rebuilt after the latest such commit
- **THEN** parsing `getCoreBuildInfo()` yields `version` equal to `TZ=UTC git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- crates/core/`

#### Scenario: getCoreBuildInfo fallback without git

- **WHEN** git is unavailable during WASM build or no commit history exists for `crates/core/`
- **THEN** `getCoreBuildInfo()` returns JSON with `version: "unknown"`
