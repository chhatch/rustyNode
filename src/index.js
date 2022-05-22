import { readFileSync, writeFileSync } from "fs";
import { compileRust } from "./rustWriter/index.js";
import { parseRuleObject } from "./ruleParser/index.js";

const rule = JSON.parse(readFileSync("rule.json", "utf8"));
const parsedRule = parseRuleObject(rule);
const compiledRust = compileRust(parsedRule);

writeFileSync("node_rust/src/main.rs", compiledRust);
