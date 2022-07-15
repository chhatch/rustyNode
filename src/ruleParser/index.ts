import { isArray, mapValues } from 'lodash'
import { exprToRust } from './parseExpression'

export const parseRules = (
  rules: Record<string, unknown> | Record<string, unknown>[]
) => toArray(rules).map((rule) => mapValues(rule, exprToRust))

function toArray(maybeArray: any) {
  return isArray(maybeArray) ? maybeArray : [maybeArray]
}
