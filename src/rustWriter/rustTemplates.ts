export const imports = `extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Read;

mod operations;

`

export const fnOpen = `fn main() {
`

export const readAndParse = (
  path: string
) => `    let mut file = fs::File::open("${path}").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");
`

export const ifStatement = (
  condition: string,
  expression: string
) => `if ${condition} {
        ${expression}
    }
`

export const elseStatement = (expression: string) => `else {
        ${expression}
    }
`

export const processAndWrite = (
  path: string
) => `let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("${path}", processed_data_string).expect("Unable to write file");
`

export const fnClose = `}`
