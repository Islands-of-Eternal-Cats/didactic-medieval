use bevy_ecs::prelude::*;
use rand::SeedableRng;
use rand::rngs::StdRng;
use wasm_bindgen::prelude::*;

use crate::components::{Path, Position, Speed, UnitId};
use crate::events::TargetReached;
use crate::resources::{DeltaTime, SimulationRng, TileMapResource};
use crate::systems::{find_path_action, move_along_path, DEFAULT_SPEED, MAX_DELTA_MS};

pub const FIELD_WIDTH: f32 = 25.0;
pub const FIELD_HEIGHT: f32 = 19.0;

#[wasm_bindgen]
pub struct GameWorld {
    world: World,
    schedule: Schedule,
}

#[wasm_bindgen(js_name = createGameWorld)]
pub fn create_game_world(unit_count: u32, seed: u64) -> GameWorld {
    let mut world = World::new();
    let mut rng = StdRng::seed_from_u64(seed);

    let tile_map = TileMapResource::new(seed);
    world.init_resource::<Messages<TargetReached>>();

    for id in 0..unit_count {
        let (col, row) = tile_map.random_walkable_tile(&mut rng);
        let (x, y) = tile_map.tile_to_world(col, row);
        world.spawn((
            UnitId(id),
            Position { x, y },
            Path { waypoints: Vec::new() },
            Speed(DEFAULT_SPEED),
        ));
    }

    world.insert_resource(tile_map);

    world.insert_resource(SimulationRng(rng));

    let mut schedule = Schedule::default();
    schedule.add_systems((find_path_action, move_along_path).chain());

    GameWorld { world, schedule }
}

#[wasm_bindgen]
impl GameWorld {
    #[wasm_bindgen(js_name = tick)]
    pub fn tick(&mut self, delta_ms: f32) {
        let capped = delta_ms.min(MAX_DELTA_MS);
        let delta_secs = capped / 1000.0;
        self.world.insert_resource(DeltaTime(delta_secs));
        self.schedule.run(&mut self.world);
        self.world
            .resource_mut::<Messages<TargetReached>>()
            .update();
    }

    #[wasm_bindgen(js_name = getTileMap)]
    pub fn get_tile_map(&self) -> String {
        let map = self.world.resource::<TileMapResource>();
        let mut json = String::from(r#"{"cols":25,"rows":19,"tiles":["#);
        for row in 0..map.rows {
            if row > 0 {
                json.push(',');
            }
            json.push('"');
            for col in 0..map.cols {
                let idx = (row * map.cols + col) as usize;
                json.push(if map.tiles[idx] { 'G' } else { 'B' });
            }
            json.push('"');
        }
        json.push_str("]}");
        json
    }

    #[wasm_bindgen(js_name = getUnitPositions)]
    pub fn get_unit_positions(&mut self) -> String {
        let mut units: Vec<(u32, f32, f32)> = self
            .world
            .query::<(&UnitId, &Position)>()
            .iter(&self.world)
            .map(|(id, pos)| (id.0, pos.x, pos.y))
            .collect();
        units.sort_by_key(|(id, _, _)| *id);

        let mut json = String::from("[");
        for (index, (id, x, y)) in units.iter().enumerate() {
            if index > 0 {
                json.push(',');
            }
            use std::fmt::Write as _;
            let _ = write!(json, r#"{{"id":{id},"x":{x},"y":{y}}}"#);
        }
        json.push(']');
        json
    }
}
