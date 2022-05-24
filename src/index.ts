import { readFileSync, writeFileSync } from "fs";
import { flow, partial, partialRight } from "lodash";
import { compileRust } from "./rustWriter/index";
import { parseRules } from "./ruleParser/index";

export const rulesToRust = flow([
  partialRight(readFileSync, "utf8"),
  JSON.parse,
  parseRules,
  compileRust,
  partial(writeFileSync, "node_rust/src/main.rs"),
]);

rulesToRust("rules.json");
