import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export function processArgs() {
  return yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .options({
      rustPath: {
        type: 'string',
        default: 'node_rust/src/main.rs',
        describe: 'Path to write rust to'
      },
      rulesPath: {
        type: 'string',
        default: 'rules.json',
        describe: 'Path to read rules from'
      },
      inputPath: {
        type: 'string',
        default: 'input.json',
        describe: 'Path to read input from'
      },
      outputPath: {
        type: 'string',
        default: 'output.json',
        describe: 'Path to write ouput to'
      }
    })
    .parseSync()
}
