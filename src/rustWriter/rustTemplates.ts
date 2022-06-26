export const imports = `extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;

mod operations;

`

export const fnOpen = `pub fn run(data_string: String) -> String {
`

export const readAndParse = () => `    let mut parsed_data: Data =
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

export const processAndWrite =
  () => `return serde_json::to_string_pretty(&parsed_data).unwrap();
`

export const fnClose = `}`
