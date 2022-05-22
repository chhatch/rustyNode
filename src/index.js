"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const index_1 = require("./rustWriter/index");
const index_2 = require("./ruleParser/index");
(0, lodash_1.flow)([
    (0, lodash_1.partialRight)(fs_1.readFileSync, "utf8"),
    JSON.parse,
    index_2.parseRuleObject,
    index_1.compileRust,
    (0, lodash_1.partial)(fs_1.writeFileSync, "node_rust/src/main.rs"),
])("rule.json");
