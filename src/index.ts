import { readFileSync, writeFileSync } from 'fs'
import { flow, partial, partialRight } from 'lodash'
import { compileRust } from './rustWriter/index'
import { parseRules } from './ruleParser/index'
import { processArgs } from './cli'
const { rustPath, rulesPath, inputPath, outputPath } = processArgs()
export const rulesToRust = flow([
  partialRight(readFileSync, 'utf8'),
  JSON.parse,
  parseRules,
  compileRust(inputPath, outputPath),
  partial(writeFileSync, rustPath)
])

rulesToRust(rulesPath)
