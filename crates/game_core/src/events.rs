use bevy_ecs::prelude::*;

use crate::resources::ObjectKind;

#[derive(Message)]
pub struct TargetReached {
    pub entity: Entity,
}

#[derive(Message)]
pub struct Hungry(pub Entity);

#[derive(Message)]
pub struct Tired(pub Entity);

#[derive(Message)]
pub struct Sated(pub Entity);

#[derive(Message)]
pub struct Rested(pub Entity);

#[derive(Message)]
pub struct BuildRequest {
    pub col: u32,
    pub row: u32,
    pub kind: ObjectKind,
}
