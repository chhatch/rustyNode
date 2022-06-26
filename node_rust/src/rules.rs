extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;

mod operations;

#[derive(Deserialize, Debug, Serialize)]
struct Data {
    rust: i32,
}
pub fn run(data_string: String) -> String {
    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");
    if true {
        parsed_data.rust = -1.1
    }
    return serde_json::to_string_pretty(&parsed_data).unwrap();
}
