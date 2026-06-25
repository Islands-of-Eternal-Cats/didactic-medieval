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
