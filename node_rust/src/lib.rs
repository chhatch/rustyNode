extern crate serde_json;
mod rules;
use std::fs;
use std::io::Read;

fn main() {
    let mut file = fs::File::open("input.json").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let processed_data_string = rules::run(data_string);
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
}
