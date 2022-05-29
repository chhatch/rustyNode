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
  key: string
  rustString: string
  type: DataTypesEnum
  operator: string | null
  operands: TermNode[]
}

export type UnwrappedThunks = [TermNode, TermNode]
