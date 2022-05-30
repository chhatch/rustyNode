import { readFileSync, writeFileSync } from 'fs'
import { flow, partial, partialRight } from 'lodash'
import { compileRust } from './rustWriter/index'
import { parseRules } from './ruleParser/index'

const [rulesPath, inputPath, outputPath] = process.argv.slice(2)
export const rulesToRust = (
  inputPath = 'input.json',
  outputPath = 'outputPath.json'
) =>
  flow([
    partialRight(readFileSync, 'utf8'),
    JSON.parse,
    parseRules,
    compileRust(inputPath, outputPath),
    partial(writeFileSync, 'node_rust/src/main.rs')
  ])

rulesToRust(inputPath, outputPath)(rulesPath || 'rules.json')
