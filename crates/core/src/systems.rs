use bevy_ecs::prelude::*;
use rand::Rng;
use rand::rngs::StdRng;

use crate::components::{Position, Speed, Target};
use crate::world::{FIELD_HEIGHT, FIELD_WIDTH};

pub const DEFAULT_SPEED: f32 = 60.0;
pub const ARRIVAL_THRESHOLD: f32 = 2.0;
pub const MAX_DELTA_MS: f32 = 100.0;

pub fn random_target(rng: &mut StdRng) -> Target {
    Target {
        x: rng.gen_range(0.0..FIELD_WIDTH),
        y: rng.gen_range(0.0..FIELD_HEIGHT),
    }
}

pub fn move_towards_target(world: &mut World, rng: &mut StdRng, delta_secs: f32) {
    let mut query = world.query::<(&mut Position, &mut Target, &Speed)>();

    for (mut pos, mut target, speed) in query.iter_mut(world) {
        let dx = target.x - pos.x;
        let dy = target.y - pos.y;
        let dist_sq = dx * dx + dy * dy;

        if dist_sq < ARRIVAL_THRESHOLD * ARRIVAL_THRESHOLD {
            let new_target = random_target(rng);
            target.x = new_target.x;
            target.y = new_target.y;
            continue;
        }

        let dist = dist_sq.sqrt();
        let step = (speed.0 * delta_secs).min(dist);
        pos.x += (dx / dist) * step;
        pos.y += (dy / dist) * step;

        pos.x = pos.x.clamp(0.0, FIELD_WIDTH);
        pos.y = pos.y.clamp(0.0, FIELD_HEIGHT);
    }
}
