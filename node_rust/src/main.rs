extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Read;
#[derive(Deserialize, Debug, Serialize)]
struct Data {
    node: bool,
    rust: String,
    ruby: String,
}
fn main() {
    let mut file = fs::File::open("input.json").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");
    if parsed_data.node {
        parsed_data.rust = "win".to_string()
    } else {
        parsed_data.ruby = "wow!".to_string()
    }
    let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
}
