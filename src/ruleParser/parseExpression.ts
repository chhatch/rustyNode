import ExpressionParser, {
  ExpressionParserOptions
} from 'expressionparser/dist/ExpressionParser'
import { flow } from 'lodash'
import { DataStructure, DataTypesEnum, TermNode } from '../types'
import { addKeysToDataStructure, addTypeToDataStructure } from './dataStructure'
import { PRIMITIVE, termNode, unwrapThunks } from './utilities'

export const dataStructure = {} as DataStructure

const joinWith = ([[lhs, rhs], operator, type]: [
  TermNode[],
  string,
  DataTypesEnum
]): TermNode => {
  const resultString = `${lhs.rustString} ${operator} ${rhs.rustString}`
  const node = termNode(lhs.key, type, resultString, operator, [lhs, rhs])
  return node
}
const joinFunc = ([[lhs, rhs], prefixOp, type]: [
  TermNode[],
  string,
  DataTypesEnum
]): TermNode => {
  const resultString = `operations::${prefixOp.toLowerCase()}(${
    lhs.rustString
  })`
  const node = termNode(resultString, type, resultString, prefixOp, [lhs, rhs])
  return node
}

const rulesToRust = {
  INFIX_OPS: {
    '+': flow(unwrapThunks, addTypeToDataStructure('+'), joinWith),
    '=': flow(unwrapThunks, addTypeToDataStructure('='), joinWith),
    '==': flow(unwrapThunks, addTypeToDataStructure('=='), joinWith),
    '!=': flow(unwrapThunks, addTypeToDataStructure('!='), joinWith),
    ',': flow(unwrapThunks, addTypeToDataStructure(','), joinWith)
  },

  PREFIX_OPS: {
    POW: flow(unwrapThunks, addTypeToDataStructure('POW'), joinFunc)
  },
  PRECEDENCE: [['SQRT', 'POW'], ['*', '/'], ['+', '-'], [',']],
  GROUP_OPEN: '(',
  GROUP_CLOSE: ')',
  SEPARATOR: ' ',
  SYMBOLS: ['(', ')', '+', '-', '*', '/', ','],

  AMBIGUOUS: {
    '-': 'NEG'
  },

  termDelegate: function (term: string) {
    let rustString
    let key = PRIMITIVE
    const type = getType(term)
    switch (type) {
      case 'boolean':
        rustString = term.toLowerCase()
        break
      case 'number':
        rustString = term
        break
      case 'string':
        rustString = term.replace(/^'|'$/g, '"') + '.to_string()'
        break
      // the catches dotted objects and arrays too
      case 'unknown':
        key = term
        rustString = `parsed_data.${term}`
        break
      default:
        throw new Error(`Unrecognized term: ${term}`)
    }
    if (type == 'unknown') addKeysToDataStructure(dataStructure, key)
    return termNode(key, type, rustString)
  }
}

function getType(value: string) {
  const lc = value.toLowerCase()
  const isBool = lc == 'true' || lc == 'false'
  // if (/^\w+\[\d+\]$/.test(value)) return 'array'
  if (/^('|").+\1$/.test(value)) return 'string'
  if (isFinite(Number(value))) return 'number'
  if (isBool) return 'boolean'
  // using this for objects and arrays
  if (typeof value === 'string') return 'unknown'
  throw new Error(`Value type not supported: ${value}`)
}

export const exprToRust = (expr: string): string => {
  const termNode = new ExpressionParser(
    rulesToRust as unknown as ExpressionParserOptions
  ).expressionToValue(expr) as unknown as TermNode

  return termNode.rustString
}
