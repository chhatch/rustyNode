import { readFileSync, writeFileSync } from "fs";
import { rustWriter } from "./rustWriter/index.js";
import { parseRuleObject } from "./ruleParser/index.js";

const rule = JSON.parse(readFileSync("rule.json", "utf8"));
const parsedRule = parseRuleObject(rule);

const conditionVar = parsedRule.if.lhs;
const targetVar = parsedRule.then.lhs;
const thenVar = "parsed_data." + targetVar;
const thenValue = stripQuotes(parsedRule.then.rhs);
const elseValue = stripQuotes(parsedRule.else.rhs);

const compiledRust = [
  rustWriter.imports,
  rustWriter.dataStruct,
  rustWriter.fnOpen,
  rustWriter.readAndParse,
  rustWriter.if,
  rustWriter.else,
  rustWriter.processAndWrite,
  rustWriter.fnClose,
]
  .join("")
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
