import { readFileSync, writeFileSync } from "fs";
import { boilerPlate } from "./rustTemplate.js";

const rule = JSON.parse(readFileSync("rule.json", "utf8"));
const splitIf = rule.if.split(" == ");
const splitThen = rule.then.split(" = ");
const splitElse = rule.else.split(" = ");
const conditionVar = splitIf[0];
const targetVar = splitThen[0];
const thenVar = "parsed_data." + targetVar;
const thenValue = stripQuotes(splitThen[1]);
const elseValue = stripQuotes(splitElse[1]);

const compiledRust = boilerPlate
  .replaceAll("IF_CONDITION", "parsed_data." + conditionVar)
  .replaceAll("CONDITION_VAR", conditionVar)
  .replaceAll("TARGET_VAR", targetVar)
  .replaceAll("THEN_VAR", thenVar)
  .replaceAll("THEN_VALUE", '"' + thenValue + '".to_string()')
  .replaceAll("ELSE_VALUE", '"' + elseValue + '".to_string()');

writeFileSync("node_rust/src/main.rs", compiledRust);

function stripQuotes(s) {
  return s.replace(/'|"/g, "");
}
