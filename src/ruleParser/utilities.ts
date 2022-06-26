import { ExpressionThunk } from 'expressionparser/dist/ExpressionParser'
import { string } from 'yargs'
import { DataTypesEnum, TermNode } from '../types'

export const PRIMITIVE = '__primitive__'

export function unwrapThunks(a: ExpressionThunk, b: ExpressionThunk) {
  const lhs = a() as unknown as TermNode
  // I think there should always be "a"
  const rhs = b ? (b() as unknown as TermNode) : false
  return [lhs, rhs].filter((x) => !!x)
}

export function termNode(
  key: string,
  type: DataTypesEnum,
  rustString: string,
  operator = '',
  operands: TermNode[] = []
): TermNode {
  return { key, rustString, type, operator, operands }
}

export const stringIsNumber = (s: string) => isFinite(Number(s))

export const stringifyOperands = (operands: TermNode[]) =>
  operands.map((op) => JSON.stringify(op, null, 2)).join('\n')

export const stringToRustFloat = (s: string) => {
  if (stringIsNumber(s) && !s.includes('.')) return `${s}.0`
  return s
}

export const processArgumentList = (s: string) =>
  s
    .split(',')
    .map((s) => s.trim())
    .map(stringToRustFloat)
    .join(',')
