import { ExpressionThunk } from 'expressionparser/dist/ExpressionParser'
import { DataTypesEnum, NodeFlow, TermNode } from '../types'

export const PRIMITIVE = '__primitive__'

export function unwrapThunks(a: ExpressionThunk, b: ExpressionThunk) {
  const lhs = a() as unknown as TermNode
  const rhs = b ? (b() as unknown as TermNode) : termNode('test', 'unknown', '')
  return [lhs, rhs]
}

export function branchNode([node, rhs, operator, lhs]: NodeFlow): NodeFlow {
  const branchedNode = { ...node, rhs, operator, lhs }
  return [branchedNode, rhs, operator, lhs]
}

export function done([node]: TermNode[]): TermNode {
  return node
}

export function termNode(
  key: string,
  type: DataTypesEnum,
  rustString: string
): TermNode {
  return { key, rustString, type }
}

export const stringIsNumber = (s: string) => isFinite(Number(s))
