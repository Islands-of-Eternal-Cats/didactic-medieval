## ADDED Requirements

### Requirement: Click selects closest unit
When the player left-clicks on the canvas, the system SHALL find the closest unit within 20px radius and select it.

#### Scenario: Click on unit selects it
- **WHEN** player clicks within 20px of a unit's position
- **THEN** that unit becomes selected; its ID is stored as `selectedUnitId`

#### Scenario: Click on empty space deselects
- **WHEN** player clicks on canvas more than 20px from any unit
- **THEN** selection is cleared

### Requirement: Unit info panel appears on selection
When a unit is selected, a panel SHALL appear in the top-right corner of the screen showing:
- Unit ID
- Satiation level (progress bar, 0-100)
- Energy level (progress bar, 0-100)
- Status text (hungry/tired/building/wandering/idle)
- Current goal (NeedsPlan kind + target, or AssignedJob col/row/kind)
- Speed value

#### Scenario: Panel shows unit info
- **WHEN** a unit is selected
- **THEN** the panel displays all fields listed above, populated from `getUnitStates()`

### Requirement: Panel has close button
The panel SHALL have an × button in its top-right corner that clears the selection.

#### Scenario: Close button clears selection
- **WHEN** player clicks × on the unit panel
- **THEN** `selectedUnitId` is set to null; panel disappears

### Requirement: Escape key clears selection
When a unit is selected and the player presses Esc, the selection SHALL be cleared.

### Requirement: Panel is semi-transparent
The panel SHALL have a semi-transparent background so the game is partially visible behind it.

### Requirement: getUnitStates returns speed and assignedJob
The `getUnitStates()` WASM function SHALL additionally return:
- `speed`: the unit's Speed value
- `assignedJob`: `{ col, row, kind }` or `null` if the unit has no `AssignedJob`

#### Scenario: Speed in getUnitStates
- **WHEN** a unit has `Speed(3.75)`
- **THEN** `getUnitStates()` returns `"speed": 3.75`

#### Scenario: Assigned job in getUnitStates
- **WHEN** a unit has `AssignedJob` and a matching `ConstructionJob` exists
- **THEN** `getUnitStates()` returns `"assignedJob": { "col": ..., "row": ..., "kind": "wall" }`

#### Scenario: No assigned job
- **WHEN** a unit does not have `AssignedJob`
- **THEN** `getUnitStates()` returns `"assignedJob": null`
