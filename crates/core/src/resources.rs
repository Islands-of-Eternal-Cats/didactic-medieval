use bevy_ecs::prelude::*;
use rand::rngs::StdRng;

#[derive(Resource)]
pub struct SimulationRng(pub StdRng);

#[derive(Resource)]
pub struct DeltaTime(pub f32);
