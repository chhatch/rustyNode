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
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let mut parsed_data: Rule =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");

    if parsed_data.node {
        parsed_data.rust = "win".to_string()
    } else {
        parsed_data.rust = "fail".to_string()
    }

    println!("{}", serde_json::to_string_pretty(&parsed_data).unwrap());
}
