## MODIFIED Requirements

### Requirement: Hello World UI

The application SHALL render a visible hello world message as the primary content of the default route. The greeting text SHALL be obtained by calling `getProgramName()` from the Rust WASM module (`crates/core` / `pkg/`), not from a hardcoded string literal in React source.

#### Scenario: Default page shows greeting from WASM

- **WHEN** the user opens the application root URL in a browser after WASM has loaded
- **THEN** the page displays text containing "Hello" (case-insensitive match acceptable, e.g. "Hello World")
- **THEN** the displayed greeting matches the return value of `getProgramName()` from the WASM module
