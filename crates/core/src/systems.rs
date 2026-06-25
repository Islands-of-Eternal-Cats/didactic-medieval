use bevy_ecs::prelude::*;
use rand::Rng;

use crate::components::{Path, Position, Speed};
use crate::events::TargetReached;
use crate::pathfinding::astar;
use crate::resources::{DeltaTime, SimulationRng, TileMapResource};
use crate::world::FIELD_HEIGHT;
use crate::world::FIELD_WIDTH;

pub const DEFAULT_SPEED: f32 = 60.0;
pub const ARRIVAL_THRESHOLD: f32 = 2.0;
pub const MAX_DELTA_MS: f32 = 100.0;
pub const MAX_RETARGET_ATTEMPTS: u32 = 20;

pub fn move_along_path(
    mut writer: MessageWriter<TargetReached>,
    time: Res<DeltaTime>,
    mut query: Query<(Entity, &mut Position, &mut Path, &Speed)>,
) {
    let delta_secs = time.0;

    for (entity, mut pos, mut path, speed) in query.iter_mut() {
        if path.waypoints.is_empty() {
            writer.write(TargetReached { entity });
            continue;
        }

        let target_x = path.waypoints[0].0;
        let target_y = path.waypoints[0].1;
        let dx = target_x - pos.x;
        let dy = target_y - pos.y;
        let dist_sq = dx * dx + dy * dy;

        if dist_sq < ARRIVAL_THRESHOLD * ARRIVAL_THRESHOLD {
            path.waypoints.remove(0);
            if path.waypoints.is_empty() {
                writer.write(TargetReached { entity });
            }
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

pub fn find_path_action(
    mut reader: MessageReader<TargetReached>,
    mut paths: Query<(&Position, &mut Path)>,
    tile_map: Res<TileMapResource>,
    mut rng: ResMut<SimulationRng>,
) {
    for event in reader.read() {
        let Ok((pos, mut path)) = paths.get_mut(event.entity) else {
            continue;
        };

        let (start_col, start_row) = tile_map.world_to_tile(pos.x, pos.y);

        for _ in 0..MAX_RETARGET_ATTEMPTS {
            let goal_col = rng.0.gen_range(0..tile_map.cols);
            let goal_row = rng.0.gen_range(0..tile_map.rows);

            if !tile_map.is_walkable(goal_col, goal_row) {
                continue;
            }

            if let Some(tile_path) = astar((start_col, start_row), (goal_col, goal_row), &tile_map)
            {
                let waypoints: Vec<(f32, f32)> = tile_path
                    .iter()
                    .map(|&(c, r)| tile_map.tile_to_world(c, r))
                    .collect();
                path.waypoints = waypoints;
                break;
            }
        }

        if path.waypoints.is_empty() {
            let fallback_col = rng.0.gen_range(0..tile_map.cols);
            let fallback_row = rng.0.gen_range(0..tile_map.rows);
            if tile_map.is_walkable(fallback_col, fallback_row) {
                let (fx, fy) = tile_map.tile_to_world(fallback_col, fallback_row);
                path.waypoints = vec![(fx, fy)];
            }
        }
    }
}
