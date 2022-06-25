import { readFileSync } from 'fs'
import { main } from 'node_rust'

const dataString = readFileSync('input.json', 'utf8')
console.log('Here we go!', dataString)
console.log('Success!', main(dataString))
