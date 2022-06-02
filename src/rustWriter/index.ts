import {
  DataStructure,
  DataStructureArray,
  DataType,
  ParsedRule
} from '../types'
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
import { isArray, isObject } from 'lodash'

export function compileRust(inputPath: string, outputPath: string) {
  return (rules: ParsedRule[]): string => {
    const stringParts = [
      imports,
      buildRustStruct({ dataStructure }),
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
  number: 'i32'
}
interface BuildArgs {
  dataStructure: DataStructure
  structName?: string
  arrayFlag?: boolean
}

export function buildRustStruct({
  dataStructure,
  structName = 'Data',
  arrayFlag = false
}: BuildArgs): string {
  const nestedStructs: string[] = []
  // we never want to see this in the rust file
  let struct = 'ERROR'
  if (isArray(dataStructure) && isArray(dataStructure[0])) {
    struct = dataStructure
      .map(structIteration({ dataStructure, nestedStructs, arrayFlag }))
      .join('')
  } else {
    struct = Object.entries(dataStructure)
      .map(structIteration({ dataStructure, nestedStructs, arrayFlag }))
      .join('')
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

interface IterationArgs {
  dataStructure: DataStructure
  nestedStructs: string[]
  arrayFlag: boolean
}
function structIteration({
  dataStructure,
  nestedStructs,
  arrayFlag = false
}: IterationArgs) {
  return ([key, prop]: [
    string,
    DataStructure | DataStructureArray | DataType
  ]): string => {
    let type

    if ('type' in prop && typeof prop.type === 'string') {
      if (prop.type !== 'unknown') type = rustTypes[prop.type]
      else throw new Error(`Unknown type at key: ${key}`)
    } else {
      type = key.toUpperCase()
      const dataEntry = dataStructure[key] as DataStructure
      const keyIsNumber = isFinite(Number(key))

      if (isArray(prop) || keyIsNumber) {
        let arrayFlag = true
        if (keyIsNumber && isObject(prop) && !isArray(prop)) {
          // arrays are heterogeneous
          type = Object.keys(prop)[0].toUpperCase()
          arrayFlag = false
        }
        nestedStructs.push(
          buildRustStruct({
            dataStructure: dataEntry,
            structName: type,
            arrayFlag
          })
        )
      } else {
        nestedStructs.push(
          buildRustStruct({
            dataStructure: dataEntry,
            structName: type,
            arrayFlag: false
          })
        )
      }
    }

    if (arrayFlag) {
      return `Vec<${type}>
`
    } else {
      return `${key}: ${type},
`
    }
  }
}
