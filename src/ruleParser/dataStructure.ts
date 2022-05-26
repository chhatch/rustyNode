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
    const type = getType(dataStructure, lhs, rhs)
    if (typeof term != 'string')
      throw new Error(`Cannot add ${term} to data structure`)
    const dataTerm = dataStructure[term]
    if (!dataTerm) throw new Error(`Key not found in data structure: ${term}`)
    if (operator == '=') dataTerm.mutable = true
    // todo: update this once term history is integrated
    //     if (type == 'rust') {
    //       console.log(`lhs: ${JSON.stringify(lhs, null, 2)}
    // rhs: ${JSON.stringify(rhs, null, 2)}
    // struct: ${JSON.stringify(dataStructure, null, 2)}`)
    //       dataTerm.type = 'number'}
    checkIfMutation(dataStructure, lhs, rhs, dataTerm.type, type)
    dataTerm.type = type
    return [lhs, operator, rhs]
  }
}
function getType(dataStructure: DataStructure, lhs: TermNode, rhs: TermNode) {
  const lhsType = dataStructure[String(lhs.value)]?.type
  const rhsType = dataStructure[String(rhs.value)]?.type
  // this is where we can walk to nodes to get types
  const lhsExistingType = lhs.type
  const rhsExistingType = rhs.type
  const type =
    [lhsType, rhsType, lhsExistingType, rhsExistingType].filter(
      (x) => x && x != 'unknown'
    )[0] || 'unknown'
  return type
}
function checkIfMutation(
  dataStructure: DataStructure,
  lhs: TermNode,
  rhs: TermNode,
  existingType: string,
  newType: string
) {
  if (existingType != 'unknown' && existingType != newType)
    throw new Error(`Property type mutation not supported: lhs: ${JSON.stringify(
      lhs,
      null,
      2
    )}
rhs: ${JSON.stringify(rhs, null, 2)}
existing type: ${existingType}
new type: ${newType}
data structure: ${JSON.stringify(dataStructure, null, 2)}`)
}
