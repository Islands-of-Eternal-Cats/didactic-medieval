## ADDED Requirements

### Requirement: Target reached event

The ECS world SHALL maintain an `Events<TargetReached>` resource. When a unit's `Position` is within the arrival threshold of its `Target`, the movement system SHALL send a `TargetReached { entity }` event. A separate system `assign_random_target` SHALL read unread `TargetReached` events in the same tick and assign a new random `Target` within field bounds.

#### Scenario: Movement sends event on arrival

- **WHEN** a unit's `Position` is within the arrival threshold of its `Target` during a `tick` call
- **THEN** the movement system sends a `TargetReached` event with the unit's entity
- **THEN** the movement system does not directly modify the unit's `Target`

#### Scenario: Assign system sets new target

- **WHEN** a `TargetReached` event is sent during a `tick` call
- **THEN** `assign_random_target` assigns a new random `Target` to that entity within field bounds (0..800, 0..600)
- **THEN** the new target is assigned in the same tick, before `Events<TargetReached>::update()` is called

## MODIFIED Requirements

### Requirement: Movement system

The ECS world SHALL include a movement system that updates each unit's `Position` toward its `Target` at the rate defined by `Speed`, given a `delta_time` in seconds. Upon arrival, the movement system SHALL send a `TargetReached` event rather than directly reassigning the target.

#### Scenario: Position moves toward target

- **WHEN** a unit's `Position` is not at its `Target` and `tick(deltaMs)` is called with `deltaMs` greater than 0
- **THEN** the unit's `Position` moves closer to its `Target`
- **THEN** the distance between `Position` and `Target` decreases

#### Scenario: Unit arrives at target

- **WHEN** a unit's `Position` is within the arrival threshold of its `Target` during a `tick` call
- **THEN** the movement system sends a `TargetReached` event for that entity
- **THEN** a new random `Target` is assigned by `assign_random_target` in the same tick
