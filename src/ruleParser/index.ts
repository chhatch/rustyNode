import { ExpressionParser } from "expressionparser";
import { isArray, mapValues } from "lodash";
import { exprToRust } from "../../expressionParser";

function parseStatement(s: string) {
  const splitString = s.split(/\s+/);
  const [lhs, operator, rhs] = splitString;
  const rustString = exprToRust(s);
  return { lhs, operator, rhs, rustString };
}

export const parseRules = (rules: {} | {}[]) =>
  toArray(rules).map((rule) => mapValues(rule, parseStatement));

function toArray(maybeArray: any) {
  return isArray(maybeArray) ? maybeArray : [maybeArray];
}
