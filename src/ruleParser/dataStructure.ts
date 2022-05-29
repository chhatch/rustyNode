import { DataStructure, DataTypesEnum, TermNode } from '../types'
import { operatorDict } from './operatorDict'
import { dataStructure } from './parseExpression'
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

export function updateDataStructure(key: string, type: DataTypesEnum): void {
  const dataEntry = dataStructure[key != PRIMITIVE ? key : '']
  // temp to avoid key not found in data structure
  // if (!dataEntry) throw new Error(`Key "${key}" not found in data structure`)
  if (dataEntry && dataEntry.type !== 'unknown' && dataEntry.type !== type) {
    throw new Error(
      `Property mutation not supported: Key "${key}" Existing type "${dataEntry.type}" New type "${type}"`
    )
    dataEntry.type = type
  }
}

export function addTypeToDataStructure(operator: string) {
  return function ([lhs, rhs]: [TermNode, TermNode]): [
    TermNode,
    string,
    TermNode
  ] {
    const terms = [lhs, rhs]
    const type = getType(lhs, rhs)
    const operatorType = operatorDict[operator].resultType
    if (type != 'unknown' && operatorType != 'unknown' && operatorType != type)
      throw typeMismatch(lhs, rhs, operator)

    for (const term of terms) {
      const key = term.key
      if (key == PRIMITIVE) continue
      if (type !== 'unknown' && term.type == 'unknown') {
        updateDataStructure(key, type)
        if (typeof key != 'string')
          throw new Error(`Invalid datastructure key: ${key}`)
        const dataTerm = dataStructure[key]
        // temp to avoid key not found in data structure
        if (!dataTerm) return [lhs, operator, rhs] //throw new Error(`Key not found in data structure: ${term}`)
        if (operator == '=') dataTerm.mutable = true
        checkIfMutation(lhs, rhs, dataTerm.type, type)
        dataTerm.type = type
      }
    }
    return [lhs, operator, rhs]
  }
}
function getType(lhs: TermNode, rhs: TermNode) {
  const lhsType = dataStructure[String(lhs.key)]?.type
  const rhsType = dataStructure[String(rhs.key)]?.type
  // this is where we can walk to nodes to get types
  const lhsExistingType = lhs.type
  const rhsExistingType = rhs.type

  const filteredTypes = [
    lhsType,
    rhsType,
    lhsExistingType,
    rhsExistingType
  ].filter((x) => x && x != 'unknown')

  const reduceTypes = (
    returnType: DataTypesEnum,
    currentType: DataTypesEnum
  ) => {
    if (currentType == 'unknown') {
      return returnType
    } else if (returnType != 'unknown' && returnType != currentType) {
      throw typeMismatch(lhs, rhs)
    }
    return currentType
  }

  const type = filteredTypes.reduce(reduceTypes, 'unknown')
  return type
}
function checkIfMutation(
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

function typeMismatch(lhs: TermNode, rhs: TermNode, operator?: string): Error {
  return new Error(`Type mismatch lhs: ${JSON.stringify(lhs, null, 2)}
rhs: ${JSON.stringify(rhs, null, 2)}}
${operator ? `operator: ${JSON.stringify(operator, null, 2)}` : ''}`)
}
