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
import { isArray } from 'lodash'

export function compileRust(inputPath: string, outputPath: string) {
  return (rules: ParsedRule[]): string => {
    const stringParts = [
      imports,
      buildRustStruct(dataStructure),
      fnOpen,
      readAndParse.replace('INPUT_PATH', inputPath)
    ]

    for (const rule of rules) {
      if (!rule.if || !rule.then)
        throw new Error(`Rule must have if and then. Invalid rule: ${rule}`)
      if (rule.if.operator !== '==' && rule.if.operator !== '!=')
        throw new Error(`Invalid operator: ${rule.operator}`)

      stringParts.push(
        ifStatement
          .replace('IF_CONDITION', rule.if.rustString)
          .replace('THEN', rule.then.rustString)
      )
      if (rule.else) {
        stringParts.push(elseStatement.replace('ELSE', rule.else.rustString))
      }
    }
    stringParts.push(
      processAndWrite.replace('OUTPUT_PATH', outputPath),
      fnClose
    )
    return stringParts.join('')
  }
}

const rustTypes = {
  boolean: 'bool',
  string: 'String',
  number: 'i32',
  array: 'Vec<string>'
}

export function buildRustStruct(
  dataStructure: DataStructure,
  structName = 'Data',
  arrayFlag = false
): string {
  const nestedStructs: string[] = []
  const structIteration = ([key, prop]: [
    string,
    DataStructure | DataStructureArray
  ]): string => {
    let type

    if ('type' in prop && typeof prop.type === 'string') {
      if (prop.type !== 'unknown') type = rustTypes[prop.type]
      else throw new Error(`Unknown type at key: ${key}`)
    } else {
      type = key.toUpperCase()
      nestedStructs.push(
        buildRustStruct(
          dataStructure[key] as DataStructure,
          type,
          isArray(prop) || isFinite(Number(key))
        )
      )
    }

    if (arrayFlag) {
      // @ts-ignore
      return `Vec<${type}>
`
    } else {
      return `${key}: ${type},
`
    }
  }
  // we never want to see this in the rust file
  let struct = 'ERROR'
  if (isArray(dataStructure) && isArray(dataStructure[0])) {
    struct = dataStructure.map(structIteration).join('')
  } else {
    // @ts-ignore
    struct = Object.entries(dataStructure).map(structIteration).join('')
  }
  let mainStruct
  if (!arrayFlag) {
    mainStruct = `#[derive(Deserialize, Debug, Serialize)]
struct ${structName} {
${struct}
}
`
  } else {
    mainStruct = `type ${structName} = ${struct};`
  }
  return mainStruct.concat(...nestedStructs)
}
