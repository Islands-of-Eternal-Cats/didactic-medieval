use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = getProgramName)]
pub fn get_program_name() -> String {
    "Hello World".into()
}
