import { readFileSync } from 'fs'
import { wasm_rules } from 'node_rust'

const dataString = readFileSync('input.json', 'utf8')
console.log('Here we go!', dataString)
console.log('Success!', wasm_rules(dataString))
