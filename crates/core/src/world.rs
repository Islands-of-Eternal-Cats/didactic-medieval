use bevy_ecs::prelude::*;
use rand::{Rng, SeedableRng};
use rand::rngs::StdRng;
use wasm_bindgen::prelude::*;

use crate::components::{Position, Speed, UnitId};
use crate::systems::{move_towards_target, random_target, DEFAULT_SPEED, MAX_DELTA_MS};

pub const FIELD_WIDTH: f32 = 800.0;
pub const FIELD_HEIGHT: f32 = 600.0;

#[wasm_bindgen]
pub struct GameWorld {
    world: World,
    rng: StdRng,
}

#[wasm_bindgen(js_name = createGameWorld)]
pub fn create_game_world(unit_count: u32, seed: u64) -> GameWorld {
    let mut world = World::new();
    let mut rng = StdRng::seed_from_u64(seed);

    for id in 0..unit_count {
        let x = rng.gen_range(0.0..FIELD_WIDTH);
        let y = rng.gen_range(0.0..FIELD_HEIGHT);
        let target = random_target(&mut rng);
        world.spawn((
            UnitId(id),
            Position { x, y },
            target,
            Speed(DEFAULT_SPEED),
        ));
    }

    GameWorld { world, rng }
}

#[wasm_bindgen]
impl GameWorld {
    #[wasm_bindgen(js_name = tick)]
    pub fn tick(&mut self, delta_ms: f32) {
        let capped = delta_ms.min(MAX_DELTA_MS);
        let delta_secs = capped / 1000.0;
        move_towards_target(&mut self.world, &mut self.rng, delta_secs);
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
