extern crate serde_json;
mod rules;
use std::fs;
use std::io::Read;
extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;
use web_sys::console;

fn main() {
    let mut file = fs::File::open("input.json").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let processed_data_string = rules::run(data_string);
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
}

#[wasm_bindgen]
pub fn wasm_rules(data_string: String) -> String {
    console::log_1(&"Greetins from Rustlandia!".into());
    return rules::run(data_string);
}
