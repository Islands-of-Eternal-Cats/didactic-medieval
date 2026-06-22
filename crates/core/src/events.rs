use bevy_ecs::prelude::*;

#[derive(Message)]
pub struct TargetReached {
    pub entity: Entity,
}
