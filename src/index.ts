import { readFileSync, writeFileSync } from "fs";
import { flow, partial, partialRight } from "lodash";
import { compileRust } from "./rustWriter/index";
import { parseRuleObject } from "./ruleParser/index";

flow([
  partialRight(readFileSync, "utf8"),
  JSON.parse,
  parseRuleObject,
  compileRust,
  partial(writeFileSync, "node_rust/src/main.rs"),
])("rule.json");
