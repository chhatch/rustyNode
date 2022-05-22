import { readFileSync, writeFileSync } from "fs";
import { flow, partial, partialRight } from "lodash-es";
import { compileRust } from "./rustWriter/index.js";
import { parseRuleObject } from "./ruleParser/index.js";

flow([
  partialRight(readFileSync, "utf8"),
  JSON.parse,
  parseRuleObject,
  compileRust,
  partial(writeFileSync, "node_rust/src/main.rs"),
])("rule.json");
