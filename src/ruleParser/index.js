"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRuleObject = void 0;
const lodash_1 = require("lodash");
function parseStatement(s) {
    const splitString = s.split(/\s+/);
    if (splitString.length !== 3)
        throw new Error(`Expected 3 parts. Invalid statement ${s}`);
    const [lhs, operator, rhs] = splitString;
    return { lhs, operator, rhs };
}
const parseRuleObject = (obj) => (0, lodash_1.mapValues)(obj, parseStatement);
exports.parseRuleObject = parseRuleObject;
