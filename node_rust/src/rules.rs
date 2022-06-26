extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;

mod operations;

#[derive(Deserialize, Debug, Serialize)]
struct Data {
    node: NODE,
    rust: RUST,
    ruby: i32,
    day_of_week: String,
    fee: i32,
    price: i32,
}
#[derive(Deserialize, Debug, Serialize)]
struct NODE {
    fp: FP,
}
type FP = Vec<bool>;
type RUST = Vec<NAIL>;
#[derive(Deserialize, Debug, Serialize)]
struct NAIL {
    nail: String,
}
pub fn run(data_string: String) -> String {
    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");
    if parsed_data.node.fp[0] == true {
        parsed_data.rust[0].nail = "win".to_string()
    } else {
        parsed_data.ruby = 1337
    }
    if parsed_data.day_of_week == "Wednesday".to_string() {
        parsed_data.fee = 2
    } else {
        parsed_data.fee = 1
    }
    if parsed_data.day_of_week == "Friday".to_string() {
        parsed_data.fee = 0
    }
    if parsed_data.day_of_week != "Friday".to_string() {
        parsed_data.price = operations::pow(parsed_data.price, parsed_data.fee)
    }
    return serde_json::to_string_pretty(&parsed_data).unwrap();
}
