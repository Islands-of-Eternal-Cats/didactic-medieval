use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = getProgramName)]
pub fn get_program_name() -> String {
    "Hello, My Dear World".into()
}

#[wasm_bindgen(js_name = getCoreBuildInfo)]
pub fn get_core_build_info() -> String {
    format!(
        r#"{{"layer":"core","version":"{}"}}"#,
        env!("CORE_BUILD_VERSION")
    )
}
