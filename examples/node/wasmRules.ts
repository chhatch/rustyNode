import { readFileSync } from 'fs'
import { wasm_rules } from 'rust-wasm'

const dataString = readFileSync('input.json', 'utf8')
console.log('Success!', wasm_rules(dataString))
