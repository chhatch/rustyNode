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

export function compileRust(rules: ParsedRule[]): string {
  const stringParts = [
    imports,
    buildRustStruct(dataStructure),
    fnOpen,
    readAndParse
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
  stringParts.push(processAndWrite, fnClose)
  return stringParts.join('')
}

const rustTypes = {
  boolean: 'bool',
  string: 'String',
  number: 'i32'
}

export function buildRustStruct(dataStructure: DataStructure): string {
  const structString = `#[derive(Deserialize, Debug, Serialize)]
struct Data {
${Object.entries(dataStructure)
  .map(
    // @ts-ignore
    ([key, { type }]) => `${key}: ${rustTypes[type]},
`
  )
  .join('')}}
`

  return structString
}

function isBoolean(value: string): boolean {
  const norm = value.toLowerCase()
  if (norm === 'true' || norm === 'false') return true
  return false
}
