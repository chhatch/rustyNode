import { DataStructure, DataStructureArray, ParsedRule } from '../types'
import { dataStructure } from '../ruleParser/parseExpression'
import {
  elseStatement,
  fnClose,
  fnOpen,
  ifStatement,
  imports,
  processAndWrite,
  readAndParse
} from './rustTemplates'
import { flow, isArray } from 'lodash'
import {
  FlowArgs,
  hasPropTypeFn,
  isFinalKey,
  rustStruct,
  rustStructType,
  rustVecType
} from './utilities'

// temporarily not using paths here
export function compileRust(inputPath: string, outputPath: string) {
  return (rules: ParsedRule[]): string => {
    const stringParts = [
      imports,
      buildRustStruct({ dataStructure }),
      fnOpen,
      readAndParse()
    ]

    for (const rule of rules) {
      if (!rule.if || !rule.then)
        throw new Error(`Rule must have if and then. Invalid rule: ${rule}`)
      if (rule.if.operator !== '==' && rule.if.operator !== '!=')
        throw new Error(`Invalid operator: ${rule.operator}`)

      stringParts.push(ifStatement(rule.if.rustString, rule.then.rustString))
      if (rule.else) {
        stringParts.push(elseStatement(rule.else.rustString))
      }
    }
    stringParts.push(processAndWrite(), fnClose)
    return stringParts.join('')
  }
}

const rustTypes = {
  boolean: 'bool',
  string: 'String',
  number: 'i32'
}
interface BuildArgs<T> {
  dataStructure: T
  structName?: string
}

export function buildRustStruct({
  dataStructure,
  structName = 'Data'
}: BuildArgs<DataStructure>): string {
  const nestedTypes: string[] = []
  const struct = Object.entries(dataStructure)
    .map(
      structIteration({
        nestedTypes,
        typeBuilder: rustStructType
      })
    )
    .join('')

  return rustStruct(structName, struct, nestedTypes)
}

export function buildRustType({
  dataStructure,
  structName
}: BuildArgs<DataStructureArray>): string {
  const nestedTypes: string[] = []
  let struct

  if (isArray(dataStructure[0])) {
    struct = dataStructure
      // @ts-ignore
      .map(
        structIteration({
          nestedTypes,
          typeBuilder: rustVecType
        })
      )
      .join('')
  } else {
    struct = Object.entries(dataStructure)
      .map(
        structIteration({
          nestedTypes,
          typeBuilder: rustVecType
        })
      )
      .join('')
  }
  return `type ${structName} = ${struct}`.concat(...nestedTypes)
}

interface IterationArgs {
  nestedTypes: string[]
  typeBuilder: (x: { key: string; type: string }) => string
}

function structIteration({ nestedTypes, typeBuilder }: IterationArgs) {
  // @ts-ignore
  return flow(
    ([key, prop]) => ({ key, prop }),
    hasPropTypeFn,
    isFinalKey,
    getType,
    buildNestedTypes(nestedTypes),
    typeBuilder
  )
}

function getType({ key, prop, hasPropType, isFinalKey }: FlowArgs) {
  // @ts-ignore
  if (hasPropType && (prop.type === 'unknown' || !prop.type))
    throw new Error(`Unknown type at key: ${key}`)

  const type: string = hasPropType
    ? // @ts-ignore
      rustTypes[prop.type]
    : !isFinalKey
    ? key.toUpperCase()
    : Object.keys(prop)[0].toUpperCase()

  return {
    key,
    prop,
    type,
    hasPropType,
    isFinalKey
  }
}

function buildNestedTypes(nestedTypes: string[]) {
  return ({ key, prop, type, hasPropType }: FlowArgs) => {
    if (!hasPropType) {
      if (isArray(prop)) {
        nestedTypes.push(
          buildRustType({
            dataStructure: prop as DataStructureArray,
            structName: type
          })
        )
      } else {
        nestedTypes.push(
          buildRustStruct({
            dataStructure: prop as DataStructure,
            structName: type
          })
        )
      }
    }
    return { key, type }
  }
}
