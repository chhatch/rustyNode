export interface ParsedRule {
  [key: string]: {
    lhs: string
    operator: string
    rhs: string
    rustString: string
  }
}
export type DataTypesEnum = 'number' | 'boolean' | 'string' | 'unknown'
export interface DataStructure {
  [key: string]: {
    type: DataTypesEnum
    mutable: boolean
  }
}
export interface TermNode {
  value: string | number | boolean
  rustString: string
  type: DataTypesEnum
  lhs?: TermNode
  operator?: string
  rhs?: TermNode
}

export type NodeFlow = [TermNode, TermNode, string, TermNode]

export type UnwrappedThunks = [TermNode, string, TermNode]
