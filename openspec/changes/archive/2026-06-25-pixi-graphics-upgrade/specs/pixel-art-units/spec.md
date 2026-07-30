## MODIFIED Requirements

### Requirement: Knight sprite generation
The system SHALL generate 16×16 pixel-art knight sprites with configurable primary color, walking animation frame, and facing direction.

#### Scenario: Knight sprite has correct structure
- **WHEN** a knight sprite is generated
- **THEN** it SHALL be 16×16 pixels
- **THEN** it SHALL have a body area filled with the configured primary color
- **THEN** it SHALL have an armor area in gray
- **THEN** it SHALL have boots in dark gray
- **THEN** it SHALL have an outline in dark color

#### Scenario: Knight sprite animates walking
- **WHEN** frame is 0 (standing)
- **THEN** both legs SHALL be in neutral position
- **WHEN** frame is 1
- **THEN** the left leg SHALL shift one pixel left
- **WHEN** frame is 2
- **THEN** the left leg SHALL shift one pixel right

#### Scenario: Knight sprite supports four facing directions
- **WHEN** a knight sprite is generated with direction `S` (south)
- **THEN** the sprite SHALL face the viewer with visible face
- **WHEN** direction is `N` (north)
- **THEN** the sprite SHALL show the back of the head with no face
- **WHEN** direction is `E` (east) or `W` (west)
- **THEN** the sprite SHALL show a side profile with the leading leg differentiated
- **THEN** `W` SHALL be a horizontal mirror of `E`

### Requirement: Unit color palette
The system SHALL provide a palette of 6 unit colors for assigning to knights.

#### Scenario: Six colors available
- **WHEN** a unit is assigned a color
- **THEN** the color SHALL be selected from the set: red (#e94560), blue (#4a9eff), gold (#ffd700), purple (#7c3aed), green (#22c55e), orange (#f97316)
