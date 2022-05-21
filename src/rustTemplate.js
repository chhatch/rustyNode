export const boilerPlate = `
extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs::File;
use std::io::Read;

#[derive(Deserialize, Debug, Serialize)]
struct Data {
    CONDITION_VAR: bool,
    TARGET_VAR: String,
}

fn main() {
    let mut file = File::open("input.json").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");

    if IF_CONDITION {
        THEN_VAR = THEN_VALUE
    } else {
        THEN_VAR = ELSE_VALUE
    }

    println!("{}", serde_json::to_string_pretty(&parsed_data).unwrap());
}
`;
