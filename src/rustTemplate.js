export const boilerPlate = `
extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs::File;
use std::io::Read;

#[derive(Deserialize, Debug, Serialize)]
struct Rule {
    node: bool,
    rust: String,
}

fn main() {
    let mut file = File::open("input.json").unwrap();
    let mut data = String::new();
    file.read_to_string(&mut data).unwrap();
    let output: Rule = serde_json::from_str(&data).expect("JSON was not well-formatted");
    println!("{}", serde_json::to_string_pretty(&output).unwrap());
}
`;
