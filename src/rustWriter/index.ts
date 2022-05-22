import { isFinite } from "lodash";

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
        THEN_VAR = THEN_VALUE
    }
`;

const elseStatement = `else {
        ELSE_VAR = ELSE_VALUE
    }
`;

const processAndWrite = `let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
`;

const fnClose = `}`;

export function compileRust(rule: Rule): string {
  const dataStructure = generateDataStructure(rule);
  let stringParts = [
    imports,
    buildRustStruct(dataStructure),
    fnOpen,
    readAndParse,
  ];
  console.log(dataStructure);

  if (rule.if) stringParts.push(ifStatement);
  if (rule.else) stringParts.push(elseStatement);
  stringParts.push(processAndWrite, fnClose);
  return replaceVariables(rule, stringParts.join(""), dataStructure);
}

function replaceVariables(
  rule: Rule,
  rustString: string,
  dataStructure: DataStructure
) {
  if (!rule.if || !rule.then)
    throw new Error("Rule must have if and then for now.");
  const conditionVar = rule.if.lhs;
  const targetVar = rule.then.lhs;
  const thenVar = "parsed_data." + targetVar;
  const thenValue = stripQuotes(rule.then.rhs);

  rustString = rustString
    .replaceAll("IF_CONDITION", "parsed_data." + conditionVar)
    .replaceAll("THEN_VAR", thenVar)
    .replaceAll(
      "THEN_VALUE",
      rustValueString(thenValue, rule.then.lhs, dataStructure)
    );

  if (rule.else) {
    const elseVar = rule.else.lhs;
    const elseValue = stripQuotes(rule.else.rhs);
    rustString = rustString
      .replaceAll(
        "ELSE_VALUE",
        rustValueString(elseValue, elseVar, dataStructure)
      )
      .replaceAll("ELSE_VAR", "parsed_data." + elseVar);
  }
  return rustString;
}

function rustValueString(
  value: string,
  dataKey: string,
  dataStructure: DataStructure
): string {
  const type = dataStructure[dataKey].type;
  if (type === "string") return '"' + value + '".to_string()';
  return value;
}

function stripQuotes(s: string) {
  return s.replace(/'|"/g, "");
}

interface Rule {
  [key: string]: { lhs: string; operator: string; rhs: string };
}

type DataTypesEnum = "number" | "boolean" | "string";
interface DataStructure {
  [key: string]: { type: DataTypesEnum; mutable: boolean };
}

function generateDataStructure(rule: Rule) {
  return Object.values(rule).reduce(
    (acc: DataStructure, { lhs, operator, rhs }) => {
      if (/\.|\[/.test(lhs))
        throw new Error(`Nested properties not supported: ${lhs}`);

      const rhsType = getType(rhs);
      const mutable = operator === "=";

      if (!acc[lhs]) {
        acc[lhs] = { type: rhsType, mutable };
      } else if (acc[lhs].type !== rhsType) {
        throw new Error(`Property type mutation not supported: ${lhs}`);
      }
      return acc;
    },
    {}
  );
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
