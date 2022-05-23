import { readFileSync, writeFileSync } from "fs";
import { flow, partial, partialRight } from "lodash";
import { compileRust } from "./rustWriter/index";
import { parseRules } from "./ruleParser/index";

flow([
  partialRight(readFileSync, "utf8"),
  JSON.parse,
  parseRules,
  compileRust,
  partial(writeFileSync, "node_rust/src/main.rs"),
])("rules.json");
