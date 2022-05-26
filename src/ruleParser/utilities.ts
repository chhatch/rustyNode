import { ExpressionThunk } from 'expressionparser/dist/ExpressionParser'
import { DataTypesEnum, NodeFlow, TermNode } from '../types'

export function unwrapThunks(a: ExpressionThunk, b: ExpressionThunk) {
  const lhs = a() as unknown as TermNode
  const rhs = b() as unknown as TermNode
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
  value: number | string | boolean,
  type: DataTypesEnum,
  rustString: string
): TermNode {
  return { value, rustString, type }
}
