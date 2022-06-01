import { DataStructure, ParsedRule } from '../types'
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
  structName = 'Data'
): string {
  const nestedStructs: string[] = []
  const mainStruct = `#[derive(Deserialize, Debug, Serialize)]
struct ${structName} {
  // map over object or array here
${Object.entries(dataStructure)
  .map(([key, prop]) => {
    let type
    if ('type' in prop && typeof prop.type === 'string') {
      if (prop.type !== 'unknown') type = rustTypes[prop.type]
      else throw new Error(`Unknown type at key: ${key}`)
    } else {
      type = key.toUpperCase()
      nestedStructs.push(
        buildRustStruct(dataStructure[key] as DataStructure, type)
      )
    }

    return `${key}: ${type},
`
  })
  .join('')}}
`

  return mainStruct.concat(...nestedStructs)
}
