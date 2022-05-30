extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Read;

mod operations;

#[derive(Deserialize, Debug, Serialize)]
struct Data {
node: NODE,
rust: RUST,
ruby: RUBY,
}
#[derive(Deserialize, Debug, Serialize)]
struct NODE {
fp: bool,
}
#[derive(Deserialize, Debug, Serialize)]
struct RUST {
status: String,
}
#[derive(Deserialize, Debug, Serialize)]
struct RUBY {
magicNumber: i32,
}
fn main() {
    let mut file = fs::File::open("input2.json").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");
if parsed_data.node.fp == true {
        parsed_data.rust.status = "win".to_string()
    }
else {
        parsed_data.ruby.magicNumber = 1337
    }
let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("output2.json", processed_data_string).expect("Unable to write file");
}