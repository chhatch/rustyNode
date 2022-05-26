import { isArray, mapValues } from 'lodash'
import { exprToRust } from './parseExpression'

function parseStatement(s: string) {
  const splitString = s.split(/\s+/)
  const [lhs, operator, rhs] = splitString
  const rustString = exprToRust(s)
  return {
    lhs,
    operator,
    rhs,
    rustString
  }
}

export const parseRules = (
  rules: Record<string, unknown> | Record<string, unknown>[]
) => toArray(rules).map((rule) => mapValues(rule, parseStatement))

function toArray(maybeArray: any) {
  return isArray(maybeArray) ? maybeArray : [maybeArray]
}
