use bevy_ecs::prelude::*;
use rand::Rng;
use rand::rngs::StdRng;

use crate::components::{Position, Speed, Target};
use crate::events::TargetReached;
use crate::resources::{DeltaTime, SimulationRng};
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

pub fn move_towards_target(
    mut writer: MessageWriter<TargetReached>,
    time: Res<DeltaTime>,
    mut query: Query<(Entity, &mut Position, &Target, &Speed)>,
) {
    let delta_secs = time.0;

    for (entity, mut pos, target, speed) in query.iter_mut() {
        let dx = target.x - pos.x;
        let dy = target.y - pos.y;
        let dist_sq = dx * dx + dy * dy;

        if dist_sq < ARRIVAL_THRESHOLD * ARRIVAL_THRESHOLD {
            writer.write(TargetReached { entity });
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

pub fn assign_random_target(
    mut reader: MessageReader<TargetReached>,
    mut targets: Query<&mut Target>,
    mut rng: ResMut<SimulationRng>,
) {
    for event in reader.read() {
        if let Ok(mut target) = targets.get_mut(event.entity) {
            *target = random_target(&mut rng.0);
        }
    }
}
