import { DataStructure, DataTypesEnum, TermNode } from '../types'
import { PRIMITIVE } from './utilities'

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

export function updateDataStructure(
  dataStructure: DataStructure,
  key: string,
  type: DataTypesEnum
): void {
  const dataEntry = dataStructure[key != PRIMITIVE ? key : '']
  // temp to avoid key not found in data structure
  // if (!dataEntry) throw new Error(`Key "${key}" not found in data structure`)
  if (dataEntry && dataEntry.type !== 'unknown') {
    throw new Error(
      `Property mutation not supported: Key "${key}" Existing type "${dataEntry.type}" New type "${type}"`
    )
    dataEntry.type = type
  }
}

export function addTypeToDataStructure(dataStructure: DataStructure) {
  return function ([lhs, operator, rhs]: [TermNode, string, TermNode]): [
    TermNode,
    string,
    TermNode
  ] {
    // how will we handle the keys for nested operations
    const key = lhs.key
    const type = getType(dataStructure, lhs, rhs)
    if (typeof key != 'string')
      throw new Error(`Invalid datastructure key: ${key}`)
    const dataTerm = dataStructure[key]
    // temp to avoid key not found in data structure
    if (!dataTerm) return [lhs, operator, rhs] //throw new Error(`Key not found in data structure: ${term}`)
    if (operator == '=') dataTerm.mutable = true
    checkIfMutation(dataStructure, lhs, rhs, dataTerm.type, type)
    dataTerm.type = type
    return [lhs, operator, rhs]
  }
}
function getType(dataStructure: DataStructure, lhs: TermNode, rhs: TermNode) {
  const lhsType = dataStructure[String(lhs.key)]?.type
  const rhsType = dataStructure[String(rhs.key)]?.type
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
