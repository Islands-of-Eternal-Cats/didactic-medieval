use bevy_ecs::prelude::*;
use rand::Rng;

use crate::components::{
    Energy, HungryDebuff, NeedKind, NeedsPlan, Path, Position, Satiation, Speed, TiredDebuff,
    UnitId,
};
use crate::events::{BuildRequest, Hungry, Rested, Sated, TargetReached, Tired};
use crate::pathfinding::astar;
use crate::resources::{DeltaTime, MapObjects, ObjectKind, SimulationRng, TileMapResource};
use crate::world::FIELD_HEIGHT;
use crate::world::FIELD_WIDTH;

pub const DEFAULT_SPEED: f32 = 3.75;
pub const ARRIVAL_THRESHOLD: f32 = 0.125;
pub const MAX_DELTA_MS: f32 = 100.0;
pub const MAX_RETARGET_ATTEMPTS: u32 = 20;

pub const HUNGER_RATE: f32 = 0.8;
pub const FATIGUE_RATE: f32 = 0.4;
pub const EAT_RATE: f32 = 15.0;
pub const SLEEP_RATE: f32 = 7.0;
pub const HUNGER_THRESHOLD: f32 = 30.0;
pub const ENERGY_THRESHOLD: f32 = 30.0;
pub const SATIATED_THRESHOLD: f32 = 90.0;
pub const RESTED_THRESHOLD: f32 = 90.0;
pub const ARRIVAL_TILE_THRESHOLD: f32 = 0.5;

pub fn needs_accrual(
    time: Res<DeltaTime>,
    mut query: Query<(Option<&mut Satiation>, Option<&mut Energy>)>,
) {
    let dt = time.0;
    for (satiation, energy) in query.iter_mut() {
        if let Some(mut s) = satiation {
            s.0 = (s.0 - HUNGER_RATE * dt).max(0.0);
        }
        if let Some(mut e) = energy {
            e.0 = (e.0 - FATIGUE_RATE * dt).max(0.0);
        }
    }
}

pub fn needs_event_check(
    mut hungry_writer: MessageWriter<Hungry>,
    mut tired_writer: MessageWriter<Tired>,
    mut sated_writer: MessageWriter<Sated>,
    mut rested_writer: MessageWriter<Rested>,
    mut commands: Commands,
    query: Query<
        (Entity, &Satiation, &Energy, Option<&HungryDebuff>, Option<&TiredDebuff>),
        With<UnitId>,
    >,
) {
    for (entity, satiation, energy, hungry_debuff, tired_debuff) in query.iter() {
        if satiation.0 < HUNGER_THRESHOLD && hungry_debuff.is_none() {
            hungry_writer.write(Hungry(entity));
            commands.entity(entity).insert(HungryDebuff);
        }
        if energy.0 < ENERGY_THRESHOLD && tired_debuff.is_none() {
            tired_writer.write(Tired(entity));
            commands.entity(entity).insert(TiredDebuff);
        }
        if satiation.0 > SATIATED_THRESHOLD && hungry_debuff.is_some() {
            sated_writer.write(Sated(entity));
            commands.entity(entity).remove::<HungryDebuff>();
        }
        if energy.0 > RESTED_THRESHOLD && tired_debuff.is_some() {
            rested_writer.write(Rested(entity));
            commands.entity(entity).remove::<TiredDebuff>();
        }
    }
}

pub fn needs_decision(
    mut hungry_reader: MessageReader<Hungry>,
    mut tired_reader: MessageReader<Tired>,
    mut sated_reader: MessageReader<Sated>,
    mut rested_reader: MessageReader<Rested>,
    mut commands: Commands,
    map_objects: Res<MapObjects>,
    tile_map: Res<TileMapResource>,
) {
    for Hungry(entity) in hungry_reader.read() {
        if let Some(target) = find_nearest_object(&map_objects, &tile_map, ObjectKind::Campfire) {
            commands.entity(*entity).insert(NeedsPlan {
                kind: NeedKind::Eat,
                target,
            });
        }
    }

    for Tired(entity) in tired_reader.read() {
        if let Some(target) = find_nearest_object(&map_objects, &tile_map, ObjectKind::Bed) {
            commands.entity(*entity).insert(NeedsPlan {
                kind: NeedKind::Sleep,
                target,
            });
        }
    }

    for Sated(entity) in sated_reader.read() {
        commands.entity(*entity).remove::<NeedsPlan>();
    }

    for Rested(entity) in rested_reader.read() {
        commands.entity(*entity).remove::<NeedsPlan>();
    }
}

pub fn execute_needs_plan(
    time: Res<DeltaTime>,
    mut query: Query<(
        &NeedsPlan,
        &mut Path,
        &Position,
        &mut Satiation,
        &mut Energy,
    )>,
    tile_map: Res<TileMapResource>,
) {
    let dt = time.0;
    for (plan, mut path, pos, mut satiation, mut energy) in query.iter_mut() {
        let (tx, ty) = plan.target;
        let dx = tx - pos.x;
        let dy = ty - pos.y;
        let dist = (dx * dx + dy * dy).sqrt();

        if dist > ARRIVAL_TILE_THRESHOLD {
            let (start_col, start_row) = tile_map.world_to_tile(pos.x, pos.y);
            let (goal_col, goal_row) = tile_map.world_to_tile(tx, ty);
            if let Some(tile_path) = astar((start_col, start_row), (goal_col, goal_row), &tile_map)
            {
                let waypoints: Vec<(f32, f32)> = tile_path
                    .iter()
                    .map(|&(c, r)| tile_map.tile_to_world(c, r))
                    .collect();
                path.waypoints = waypoints;
            }
        } else {
            path.waypoints.clear();
            match plan.kind {
                NeedKind::Eat => {
                    satiation.0 = (satiation.0 + EAT_RATE * dt).min(100.0);
                }
                NeedKind::Sleep => {
                    energy.0 = (energy.0 + SLEEP_RATE * dt).min(100.0);
                }
            }
        }
    }
}

pub fn construction_system(
    mut reader: MessageReader<BuildRequest>,
    mut map_objects: ResMut<MapObjects>,
    mut tile_map: ResMut<TileMapResource>,
) {
    for event in reader.read() {
        if event.col >= tile_map.cols || event.row >= tile_map.rows {
            continue;
        }
        let idx = (event.row * tile_map.cols + event.col) as usize;
        if idx >= map_objects.tiles.len() {
            continue;
        }
        if map_objects.tiles[idx].is_some() {
            continue;
        }
        if event.kind == ObjectKind::Wall && !tile_map.is_walkable(event.col, event.row) {
            continue;
        }
        if event.kind == ObjectKind::Wall {
            tile_map.tiles[idx] = false;
        }
        map_objects.tiles[idx] = Some(event.kind);
    }
}

fn find_nearest_object(
    map_objects: &MapObjects,
    tile_map: &TileMapResource,
    kind: ObjectKind,
) -> Option<(f32, f32)> {
    let mut best_dist = f32::MAX;
    let mut best_pos = None;
    for row in 0..tile_map.rows {
        for col in 0..tile_map.cols {
            let idx = (row * tile_map.cols + col) as usize;
            if idx >= map_objects.tiles.len() {
                continue;
            }
            if map_objects.tiles[idx] != Some(kind) {
                continue;
            }
            let (cx, cy) = tile_map.tile_to_world(col, row);
            let d = match best_pos {
                Some((bx, by)) => (cx - bx) * (cx - bx) + (cy - by) * (cy - by),
                None => cx * cx + cy * cy,
            };
            if d < best_dist {
                best_dist = d;
                best_pos = Some((cx, cy));
            }
        }
    }
    best_pos
}

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
    plans: Query<&NeedsPlan>,
    tile_map: Res<TileMapResource>,
    mut rng: ResMut<SimulationRng>,
) {
    for event in reader.read() {
        if plans.get(event.entity).is_ok() {
            continue;
        }
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
