import { isFinite } from "lodash";
import { DataStructure, ParsedRule } from "../types";

const imports = `extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Read;
`;

const fnOpen = `fn main() {
`;

const readAndParse = `    let mut file = fs::File::open("input.json").unwrap();
    let mut data_string = String::new();

    file.read_to_string(&mut data_string).unwrap();

    let mut parsed_data: Data =
        serde_json::from_str(&data_string).expect("JSON was not well-formatted");
`;

const ifStatement = `if IF_CONDITION {
        VAR = VALUE
    }
`;

const elseStatement = `else {
        VAR = VALUE
    }
`;

const processAndWrite = `let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
`;

const fnClose = `}`;

export function compileRust(rules: ParsedRule[]): string {
  const dataStructure = generateDataStructure(rules);
  let stringParts = [
    imports,
    buildRustStruct(dataStructure),
    fnOpen,
    readAndParse,
  ];
  console.log(dataStructure);

  for (let rule of rules) {
    if (!rule.if || !rule.then)
      throw new Error(`Rule must have if and then. Invalid rule: ${rule}`);
    if (rule.if.operator !== "==" && rule.if.operator !== "!=")
      throw new Error(`Invalid operator: ${rule.operator}`);

    const ifCondition = `parsed_data.${rule.if.lhs} ${
      rule.if.operator
    } ${rustValueString(rule.if.rhs, rule.if.lhs, dataStructure)}`;
    stringParts.push(
      ifStatement
        .replace("IF_CONDITION", ifCondition)
        .replace("VAR", "parsed_data." + rule.then.lhs)
        .replace(
          "VALUE",

          rustValueString(rule.then.rhs, rule.then.lhs, dataStructure)
        )
    );
    if (rule.else)
      stringParts.push(
        elseStatement.replace("VAR", "parsed_data." + rule.else.lhs).replace(
          "VALUE",

          rustValueString(rule.else.rhs, rule.else.lhs, dataStructure)
        )
      );
  }
  stringParts.push(processAndWrite, fnClose);
  return stringParts.join("");
}

function rustValueString(
  value: string,
  dataKey: string,
  dataStructure: DataStructure
): string {
  const type = dataStructure[dataKey].type;
  if (type === "string") return '"' + stripQuotes(value) + '".to_string()';
  return value;
}

function stripQuotes(s: string) {
  return s.replace(/'|"/g, "");
}

function generateDataStructure(rules: ParsedRule[]): DataStructure {
  let dataStructure = {};
  for (let rule of rules) {
    dataStructure = Object.values(rule).reduce(
      (dataStructure: DataStructure, { lhs, operator, rhs }) => {
        if (/\.|\[/.test(lhs))
          throw new Error(`Nested properties not supported: ${lhs}`);

        const rhsType = getType(rhs);
        const mutable = operator === "=";

        if (!dataStructure[lhs]) {
          dataStructure[lhs] = { type: rhsType, mutable };
        } else if (dataStructure[lhs].type !== rhsType) {
          throw new Error(`Property type mutation not supported: ${lhs}`);
        }
        return dataStructure;
      },
      dataStructure
    );
  }
  return dataStructure;
}

const rustTypes = {
  boolean: "bool",
  string: "String",
  number: "i32",
};

function buildRustStruct(dataStructure: DataStructure): string {
  const structString = `#[derive(Deserialize, Debug, Serialize)]
struct Data {
${Object.entries(dataStructure)
  .map(
    ([key, { type }]) => `${key}: ${rustTypes[type]},
`
  )
  .join("")}}
`;

  return structString;
}

function getType(value: string) {
  if (/^'.+'$/.test(value)) return "string";
  if (isFinite(Number(value))) return "number";
  if (isBoolean(value)) return "boolean";
  throw new Error(`Value type not supported: ${value}`);
}

function isBoolean(value: string): boolean {
  const norm = value.toLowerCase();
  if (norm === "true" || norm === "false") return true;
  return false;
}
