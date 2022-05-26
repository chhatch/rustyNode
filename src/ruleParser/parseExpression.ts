import ExpressionParser, {
  ExpressionParserOptions,
  ExpressionThunk
} from 'expressionparser/dist/ExpressionParser'
import { DataStructure, DataTypesEnum } from '../types'

interface ParsedExpr {
  value: string | number
  rustString: string
  type: DataTypesEnum
  lhs?: ParsedExpr
  operator?: string
  rhs?: ParsedExpr
}
export const dataStructure = {} as DataStructure

const joinWith =
  (operator: string) => (a: ExpressionThunk, b: ExpressionThunk) => {
    const [aParsed, bParsed] = unwrapThunks(a, b)
    const resultString = `${aParsed.rustString} ${operator} ${bParsed.rustString}`
    addTypeToDataStructure(aParsed.value as string, bParsed.type, operator)
    return parsedTerm(resultString, 'done', resultString)
  }
const testLanguage = {
  INFIX_OPS: {
    '+': function (a: ExpressionThunk, b: ExpressionThunk) {
      const [aParsed, bParsed] = unwrapThunks(a, b)
      if (aParsed.type === 'number' && bParsed.type === 'number') {
        // @ts-ignore
        const sum = aParsed.value + bParsed.value
        return parsedTerm(sum, 'number', String(sum))
      }
      if (aParsed.type === 'variable' || bParsed.type === 'variable') {
        const resultString = `${aParsed.rustString} + ${bParsed.rustString}`
        return parsedTerm(resultString, 'done', resultString)
      }
    },
    '=': joinWith('='),
    '==': joinWith('=='),
    '!=': joinWith('!=')
  },
  PREFIX_OPS: {
    POW: function (expr: ExpressionThunk) {
      // @ts-ignore
      return Math.pow(expr()[0], expr()[1])
    }
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
      case 'variable':
        value = term
        rustString = `parsed_data.${term}`
        break
      default:
        throw new Error(`Unrecognized term: ${term}`)
    }
    if (type == 'variable') addKeysToDataStructure(term)
    return parsedTerm(value, type, rustString)
  }
}

function getType(value: string) {
  const lc = value.toLocaleLowerCase()
  const isBool = lc == 'true' || lc == 'false'
  if (/^('|").+\1$/.test(value)) return 'string'
  if (isFinite(Number(value))) return 'number'
  if (isBool) return 'boolean'
  if (typeof value === 'string') return 'variable'
  throw new Error(`Value type not supported: ${value}`)
}
function parsedTerm(
  value: number | string | boolean,
  type: string,
  rustString: string
) {
  return { rustString, value, type }
}

export const exprToRust = (expr: string): string => {
  const parsedExpr = new ExpressionParser(
    testLanguage as unknown as ExpressionParserOptions
  ).expressionToValue(expr) as unknown as ParsedExpr
  return parsedExpr.rustString
}

function addKeysToDataStructure(term: string): void {
  if (!dataStructure[term])
    dataStructure[term] = {
      type: 'unknown',
      mutable: false
    }
}

function addTypeToDataStructure(
  term: string,
  type: DataTypesEnum,
  operator: string
): void {
  const dataTerm = dataStructure[term]
  if (!dataTerm) throw new Error(`Key not found in data structure: ${term}`)
  if (dataTerm.type != 'unknown' && dataTerm.type != type)
    throw new Error(`Property type mutation not supported: ${term}`)
  if (operator == '=') dataTerm.mutable = true
  // todo: update this once term history is integrated
  if (type == 'done') dataTerm.type = 'number'
  else dataTerm.type = type
}

function unwrapThunks(a: ExpressionThunk, b: ExpressionThunk) {
  const aParsed = a() as unknown as ParsedExpr
  const bParsed = b() as unknown as ParsedExpr
  return [aParsed, bParsed]
}
