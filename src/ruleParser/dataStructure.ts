import { DataStructure, TermNode, UnwrappedThunks } from '../types'

export function addKeysToDataStructure(
  dataStructure: DataStructure,
  term: string
): void {
  if (!dataStructure[term])
    dataStructure[term] = {
      type: 'unknown',
      mutable: false
    }
}

export function addTypeToDataStructure(
  dataStructure: DataStructure,
  operator: string
) {
  return function ([lhs, rhs]: [TermNode, TermNode]): UnwrappedThunks {
    const term = lhs.value
    const type = rhs.type
    if (typeof term != 'string')
      throw new Error(`Cannot add ${term} to data structure`)
    const dataTerm = dataStructure[term]
    if (!dataTerm) throw new Error(`Key not found in data structure: ${term}`)
    if (dataTerm.type != 'unknown' && dataTerm.type != type)
      throw new Error(`Property type mutation not supported: ${term}`)
    if (operator == '=') dataTerm.mutable = true
    // todo: update this once term history is integrated
    if (type == 'rust') dataTerm.type = 'number'
    else dataTerm.type = type
    return [lhs, operator, rhs]
  }
}
