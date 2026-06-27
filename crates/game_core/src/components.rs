use bevy_ecs::prelude::*;

#[derive(Component)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Component)]
pub struct UnitId(pub u32);

#[derive(Component)]
pub struct Path {
    pub waypoints: Vec<(f32, f32)>,
}

#[derive(Component)]
pub struct Speed(pub f32);

#[derive(Component)]
pub struct Satiation(pub f32);

#[derive(Component)]
pub struct Energy(pub f32);

#[derive(Component)]
pub struct NeedsPlan {
    pub kind: NeedKind,
    pub target: (f32, f32),
}

#[derive(Component)]
pub struct HungryDebuff;

#[derive(Component)]
pub struct TiredDebuff;

#[derive(Clone, Copy, PartialEq)]
pub enum NeedKind {
    Eat,
    Sleep,
}

#[derive(Component)]
pub struct AssignedJob;
