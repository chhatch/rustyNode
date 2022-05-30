import { get, set } from 'lodash'
import { DataStructure, DataTypesEnum, TermNode } from '../types'
import { operatorDict } from './operatorDict'
import { dataStructure } from './parseExpression'
import { PRIMITIVE, stringifyOperands } from './utilities'

export function addKeysToDataStructure(
  dataStructure: DataStructure,
  term: string
): void {
  if (!get(dataStructure, term))
    set(dataStructure, term, {
      type: 'unknown',
      mutable: false
    })
}

export function updateDataStructure(key: string, type: DataTypesEnum): void {
  const dataEntry = key !== PRIMITIVE ? get(dataStructure, key) : ''
  // temp to avoid key not found in data structure
  // if (!dataEntry) throw new Error(`Key "${key}" not found in data structure`)
  if (dataEntry && dataEntry.type !== 'unknown' && dataEntry.type !== type) {
    throw new Error(
      `Property mutation not supported: Key "${key}" Existing type "${dataEntry.type}" New type "${type}"`
    )
    // @ts-ignore
    if (typeof dataEntry.type === 'object')
      throw new Error(
        `Object manipulation not supported ${JSON.stringify(
          dataEntry,
          null,
          2
        )}`
      )
    // @ts-ignore
    dataEntry.type = type
  }
}

export function addTypeToDataStructure(operator: string) {
  return function (operands: TermNode[]): [TermNode[], string] {
    const type = getType(operands)
    const operatorType = operatorDict[operator].resultType
    if (type != 'unknown' && operatorType != 'unknown' && operatorType != type)
      throw typeMismatch(operands, operator)

    for (const operand of operands) {
      const key = operand.key
      if (key == PRIMITIVE) continue
      if (type !== 'unknown' && operand.type == 'unknown') {
        // @ts-ignore
        updateDataStructure(key, type)
        if (typeof key != 'string')
          throw new Error(`Invalid datastructure key: ${key}`)
        const dataTerm = get(dataStructure, key)
        // temp to avoid key not found in data structure
        if (!dataTerm) return [operands, operator] //throw new Error(`Key not found in data structure: ${term}`)
        if (operator == '=') dataTerm.mutable = true
        // @ts-ignore
        checkIfMutation(operands, dataTerm.type, type)
        dataTerm.type = type
      }
    }
    return [operands, operator]
  }
}
function getType(operands: TermNode[]) {
  // this is where we can walk to nodes to get types
  const types = operands.map((term) => get(dataStructure, term.key)?.type)
  const existingTypes = operands.map((term) => term.type)

  const filteredTypes = [...types, ...existingTypes].filter(
    (x) => x && x != 'unknown'
  )

  const reduceTypes = (
    returnType: DataTypesEnum,
    currentType: DataTypesEnum
  ) => {
    if (currentType == 'unknown') {
      return returnType
    } else if (returnType != 'unknown' && returnType != currentType) {
      throw typeMismatch(operands)
    }
    return currentType
  }

  // @ts-ignore
  const type = filteredTypes.reduce(reduceTypes, 'unknown')
  return type
}
function checkIfMutation(
  operands: TermNode[],
  existingType: string,
  newType: string
) {
  if (existingType != 'unknown' && existingType != newType)
    throw new Error(`Property type mutation not supported: lhs: ${stringifyOperands(
      operands
    )}
existing type: ${existingType}
new type: ${newType}
data structure: ${JSON.stringify(dataStructure, null, 2)}`)
}

function typeMismatch(operands: TermNode[], operator?: string): Error {
  return new Error(`Type mismatch ${stringifyOperands(operands)}
${operator ? `operator: ${JSON.stringify(operator, null, 2)}` : ''}`)
}
