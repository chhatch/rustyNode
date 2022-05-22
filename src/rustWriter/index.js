"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileRust = void 0;
const lodash_1 = require("lodash");
const imports = `extern crate serde_json;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Read;
`;
const dataStruct = `#[derive(Deserialize, Debug, Serialize)]
struct Data {
    CONDITION_VAR: bool,
    TARGET_VAR: String,
}
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
        THEN_VAR = ELSE_VALUE
    }
`;
const processAndWrite = `let processed_data_string = serde_json::to_string_pretty(&parsed_data).unwrap();
    println!("{}", processed_data_string);
    fs::write("output.json", processed_data_string).expect("Unable to write file");
`;
const fnClose = `}`;
function compileRust(rule) {
    let stringParts = [imports, dataStruct, fnOpen, readAndParse];
    const dataStructure = generateDataStructure(rule);
    console.log(dataStructure);
    if (rule.if)
        stringParts.push(ifStatement);
    if (rule.else)
        stringParts.push(elseStatement);
    stringParts.push(processAndWrite, fnClose);
    return replaceVariables(rule, stringParts.join(""));
}
exports.compileRust = compileRust;
function replaceVariables(rule, rustString) {
    if (!rule.if || !rule.then)
        throw new Error("Rule must have if and then for now.");
    const conditionVar = rule.if.lhs;
    const targetVar = rule.then.lhs;
    const thenVar = "parsed_data." + targetVar;
    const thenValue = stripQuotes(rule.then.rhs);
    rustString = rustString
        .replaceAll("IF_CONDITION", "parsed_data." + conditionVar)
        .replaceAll("CONDITION_VAR", conditionVar)
        .replaceAll("TARGET_VAR", targetVar)
        .replaceAll("THEN_VAR", thenVar)
        .replaceAll("THEN_VALUE", '"' + thenValue + '".to_string()');
    if (rule.else) {
        const elseValue = stripQuotes(rule.else.rhs);
        rustString = rustString.replaceAll("ELSE_VALUE", '"' + elseValue + '".to_string()');
    }
    return rustString;
}
function stripQuotes(s) {
    return s.replace(/'|"/g, "");
}
function generateDataStructure(rule) {
    return Object.values(rule).reduce((acc, { lhs, rhs }) => {
        if (/\.|\[/.test(lhs))
            throw new Error(`Nested properties not supported: ${lhs}`);
        const rhsType = getType(rhs);
        if (!acc[lhs]) {
            acc[lhs] = { type: rhsType };
        }
        else if (acc[lhs].type !== rhsType) {
            throw new Error(`Property type mutation not supported: ${lhs}`);
        }
        return acc;
    }, {});
}
function getType(value) {
    if (/^'\w+'$/.test(value))
        return "string";
    if ((0, lodash_1.isFinite)(Number(value)))
        return "number";
    if (isBoolean(value))
        return "boolean";
    throw new Error(`Value type not supported: ${value}`);
}
function isBoolean(value) {
    const norm = value.toLowerCase();
    if (norm === "true" || norm === "false")
        return true;
    return false;
}
