## ADDED Requirements

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

The application SHALL render a visible hello world message as the primary content of the default route.

#### Scenario: Default page shows greeting

- **WHEN** the user opens the application root URL in a browser
- **THEN** the page displays text containing "Hello" (case-insensitive match acceptable, e.g. "Hello World")

### Requirement: React root mount

The application SHALL mount a React root component into the DOM element designated in `index.html`.

#### Scenario: React renders into root

- **WHEN** the page loads
- **THEN** the `#root` (or equivalent) container is populated by React-rendered content, not empty static HTML alone
