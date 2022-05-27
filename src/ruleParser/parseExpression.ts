import ExpressionParser, {
  ExpressionParserOptions,
  ExpressionThunk
} from 'expressionparser/dist/ExpressionParser'
import { flow } from 'lodash'
import {
  DataStructure,
  DataTypesEnum,
  NodeFlow,
  TermNode,
  UnwrappedThunks
} from '../types'
import { addKeysToDataStructure, addTypeToDataStructure } from './dataStructure'
import {
  branchNode,
  done,
  stringIsNumber,
  termNode,
  unwrapThunks
} from './utilities'

export const dataStructure = {} as DataStructure

const joinWith = ([lhs, operator, rhs]: UnwrappedThunks): NodeFlow => {
  const resultString = `${lhs.rustString} ${operator} ${rhs.rustString}`
  let type: DataTypesEnum = 'unknown'
  if (lhs.type != 'unknown') type = lhs.type
  else if (rhs.type != 'unknown') type = rhs.type
  const node = termNode(resultString, type, resultString)
  return [node, rhs, operator, lhs]
}
const exponent = ([lhs, operator, rhs]: UnwrappedThunks): NodeFlow => {
  const resultString = `operations::pow(${lhs.rustString})`
  const node = termNode(resultString, 'number', resultString)
  return [node, rhs, operator, lhs]
}
const packArgs = ([lhs, operator, rhs]: UnwrappedThunks): NodeFlow => {
  const resultString = `${lhs.rustString}, ${rhs.rustString}`
  const node = termNode(lhs.value, 'number', resultString)
  return [node, rhs, operator, lhs]
}
const rulesToRust = {
  INFIX_OPS: {
    '+': flow(
      unwrapThunks,
      addTypeToDataStructure(dataStructure, '+'),
      joinWith,
      branchNode,
      done
    ),
    '=': flow(
      unwrapThunks,
      addTypeToDataStructure(dataStructure, '='),
      joinWith,
      branchNode,
      done
    ),
    '==': flow(
      unwrapThunks,
      addTypeToDataStructure(dataStructure, '=='),
      joinWith,
      done
    ),
    '!=': flow(
      unwrapThunks,
      addTypeToDataStructure(dataStructure, '!='),
      joinWith,
      done
    ),
    ',': flow(
      unwrapThunks,
      addTypeToDataStructure(dataStructure, ','),
      packArgs,
      done
    )
  },

  PREFIX_OPS: {
    POW: flow(
      unwrapThunks,
      addTypeToDataStructure(dataStructure, 'POW'),
      exponent,
      done
    )
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
    let value
    const type = getType(term)
    switch (type) {
      case 'string':
        value = term.replace(/^'/, '"').replace(/'$/, '"')
        rustString = value + '.to_string()'
        break
      case 'number':
        value = parseInt(term)
        rustString = term
        break
      case 'boolean':
        value = term.toLowerCase() === 'true'
        rustString = term.toLowerCase()
        break
      case 'unknown':
        value = term
        rustString = `parsed_data.${term}`
        break
      default:
        throw new Error(`Unrecognized term: ${term}`)
    }
    if (type == 'unknown') addKeysToDataStructure(dataStructure, term)
    return termNode(value, type, rustString)
  }
}

function getType(value: string) {
  const lc = value.toLocaleLowerCase()
  const isBool = lc == 'true' || lc == 'false'
  if (/^('|").+\1$/.test(value)) return 'string'
  if (isFinite(Number(value))) return 'number'
  if (isBool) return 'boolean'
  if (typeof value === 'string') return 'unknown'
  throw new Error(`Value type not supported: ${value}`)
}

export const exprToRust = (expr: string): string => {
  const termNode = new ExpressionParser(
    rulesToRust as unknown as ExpressionParserOptions
  ).expressionToValue(expr) as unknown as TermNode

  return termNode.rustString
}
