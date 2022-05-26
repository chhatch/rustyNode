export interface ParsedRule {
  [key: string]: {
    lhs: string
    operator: string
    rhs: string
    rustString: string
  }
}
// done will be moved to a state prop or something
export type DataTypesEnum =
  | 'number'
  | 'boolean'
  | 'string'
  | 'variable'
  | 'unknown'
  | 'done'

export interface DataStructure {
  [key: string]: {
    type: DataTypesEnum
    mutable: boolean
  }
}
