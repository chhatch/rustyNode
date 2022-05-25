import { isFinite } from "lodash";
import { DataStructure, ParsedRule } from "../types";
import { dataStructure } from "../ruleParser/parseExpression";

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
        THEN
    }
`;

const elseStatement = `else {
        ELSE
    }
`;

const processAndWrite = `let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
`;

const fnClose = `}`;

export function compileRust(rules: ParsedRule[]): string {
  const stringParts = [
    imports,
    buildRustStruct(dataStructure),
    fnOpen,
    readAndParse,
  ];

  for (const rule of rules) {
    if (!rule.if || !rule.then)
      throw new Error(`Rule must have if and then. Invalid rule: ${rule}`);
    if (rule.if.operator !== "==" && rule.if.operator !== "!=")
      throw new Error(`Invalid operator: ${rule.operator}`);

    stringParts.push(
      ifStatement
        .replace("IF_CONDITION", rule.if.rustString)
        .replace("THEN", rule.then.rustString)
        .replace(
          "VALUE",

          rustValueString(rule.then.rhs, rule.then.lhs, dataStructure)
        )
    );
    if (rule.else) {
      stringParts.push(elseStatement.replace("ELSE", rule.else.rustString));
    }
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

const rustTypes = {
  boolean: "bool",
  string: "String",
  number: "i32",
};

export function buildRustStruct(dataStructure: DataStructure): string {
  const structString = `#[derive(Deserialize, Debug, Serialize)]
struct Data {
${Object.entries(dataStructure)
  .map(
    // @ts-ignore
    ([key, { type }]) => `${key}: ${rustTypes[type]},
`
  )
  .join("")}}
`;

  return structString;
}

function getType(value: string) {
  const hasQuotes = /^('|").+\1$/.test(value);
  if (hasQuotes) return "string";
  if (isFinite(Number(value)) || /\+/.test(value)) return "number";
  if (isBoolean(value)) return "boolean";
  if (!hasQuotes) return "number";
  throw new Error(`Value type not supported: ${value}`);
}

function isBoolean(value: string): boolean {
  const norm = value.toLowerCase();
  if (norm === "true" || norm === "false") return true;
  return false;
}
