import ExpressionParser, {
  ExpressionParserOptions
} from 'expressionparser/dist/ExpressionParser'
import { flow } from 'lodash'
import {
  DataStructure,
  DataTypesEnum,
  NodeFlow,
  TermNode,
  UnwrappedThunks
} from '../types'
import {
  addKeysToDataStructure,
  addTypeToDataStructure,
  updateDataStructure
} from './dataStructure'
import { operatorDict } from './operatorDict'
import {
  branchNode,
  done,
  PRIMITIVE,
  termNode,
  unwrapThunks
} from './utilities'

export const dataStructure = {} as DataStructure

const joinWith = ([lhs, operator, rhs]: [
  TermNode,
  string,
  TermNode
]): NodeFlow => {
  const resultString = `${lhs.rustString} ${operator} ${rhs.rustString}`
  let type: DataTypesEnum = 'unknown'
  if (lhs.type != 'unknown') type = lhs.type
  else if (rhs.type != 'unknown') type = rhs.type
  const node = termNode(lhs.key, type, resultString)
  return [node, rhs, operator, lhs]
}
const exponent = ([lhs, rhs]: UnwrappedThunks): NodeFlow => {
  const resultString = `operations::pow(${lhs.rustString})`
  const node = termNode(resultString, 'number', resultString)
  return [node, rhs, 'POW', lhs]
}

const rulesToRust = {
  INFIX_OPS: {
    '+': flow(
      unwrapThunks,
      argTypes('+'),
      joinWith,
      addTypeToDataStructure(dataStructure),
      branchNode,
      done
    ),
    '=': flow(
      unwrapThunks,
      argTypes('='),
      joinWith,
      addTypeToDataStructure(dataStructure),
      branchNode,
      done
    ),
    '==': flow(
      unwrapThunks,
      argTypes('=='),
      joinWith,
      addTypeToDataStructure(dataStructure),
      done
    ),
    '!=': flow(
      unwrapThunks,
      argTypes('!='),
      joinWith,
      addTypeToDataStructure(dataStructure),
      done
    ),
    ',': flow(
      unwrapThunks,
      argTypes(','),
      joinWith,
      addTypeToDataStructure(dataStructure),
      done
    )
  },

  PREFIX_OPS: {
    POW: flow(
      unwrapThunks,
      argTypes('POW'),
      addTypeToDataStructure(dataStructure),
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
    let key
    const type = getType(term)
    switch (type) {
      case 'string':
        key = PRIMITIVE
        rustString = term.replace(/^'|'$/g, '"') + '.to_string()'
        break
      case 'number':
        key = PRIMITIVE
        rustString = term
        break
      case 'boolean':
        key = PRIMITIVE
        rustString = term.toLowerCase()
        break
      case 'unknown':
        key = term
        rustString = `parsed_data.${term}`
        break
      default:
        throw new Error(`Unrecognized term: ${term}`)
    }
    if (type == 'unknown') addKeysToDataStructure(dataStructure, term)
    return termNode(key, type, rustString)
  }
}

function argTypes(operator: keyof typeof operatorDict) {
  return function ([lhs, rhs]: UnwrappedThunks): [TermNode, string, TermNode] {
    const operatorType = operatorDict[operator].resultType
    if (operatorType !== 'unknown' && lhs.type == 'unknown') {
      updateDataStructure(dataStructure, lhs.key, operatorType)
    }
    return [lhs, operator, rhs]
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
