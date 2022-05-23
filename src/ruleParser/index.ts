import { isArray, mapValues } from "lodash";

function parseStatement(s: string) {
  const splitString = s.split(/\s+/);
  if (splitString.length !== 3)
    throw new Error(`Expected 3 parts. Invalid statement ${s}`);
  const [lhs, operator, rhs] = splitString;
  return { lhs, operator, rhs };
}

export const parseRules = (rules: {} | {}[]) =>
  toArray(rules).map((rule) => mapValues(rule, parseStatement));

function toArray(maybeArray: any) {
  return isArray(maybeArray) ? maybeArray : [maybeArray];
}
