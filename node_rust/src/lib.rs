extern crate wasm_bindgen;
use web_sys::console;

use wasm_bindgen::prelude::*;

mod rules;

#[wasm_bindgen]
pub fn main(data_string: String) -> String {
    console::log_1(&"Greetins from Rustlandia!".into());
    return rules::run(data_string);
}
