import { get, set } from 'lodash'
import { DataStructure, DataType, DataTypesEnum, TermNode } from '../types'
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
  if (key === PRIMITIVE)
    throw new Error(`Cannot add primitive to data structure: ${key}`)
  const dataEntry = get(dataStructure, key)
  if ('type' in dataEntry) dataEntry as DataType
  else throw new Error(`Unexpected data entry ${dataEntry}`)

  if (!dataEntry) throw new Error(`Key "${key}" not found in data structure`)

  if (dataEntry.type !== 'unknown' && dataEntry.type !== type) {
    throw new Error(
      `Property mutation not supported: Key "${key}" Existing type "${dataEntry.type}" New type "${type}"`
    )
  }
  dataEntry.type = type
}

export function addTypeToDataStructure(operator: string) {
  return function (operands: TermNode[]): [TermNode[], string, DataTypesEnum] {
    const type = getType(operands)
    const operatorType = operatorDict[operator].resultType
    if (type != 'unknown' && operatorType != 'unknown' && operatorType != type)
      throw typeMismatch(operands, operator)

    for (const operand of operands) {
      const key = operand.key
      if (key == PRIMITIVE) continue
      if (type !== 'unknown' && operand.type == 'unknown') {
        updateDataStructure(key, type)
        if (typeof key != 'string')
          throw new Error(`Invalid datastructure key: ${key}`)
        const dataTerm = get(dataStructure, key)
        if (!dataTerm)
          throw new Error(`Key not found in data structure: ${key}`)
        if (operator == '=' && 'mutable' in dataTerm) dataTerm.mutable = true
        if ('type' in dataTerm && typeof dataTerm.type === 'string') {
          checkIfMutation(operands, dataTerm.type, type)
          dataTerm.type = type
        } else
          throw new Error(`We goofed up ${JSON.stringify(operator, null, 2)}`)
      }
    }
    return [operands, operator, type]
  }
}
function getType(operands: TermNode[]) {
  // this is where we can walk to nodes to get types
  // @ts-ignore
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
