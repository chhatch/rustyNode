import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export function processArgs() {
  return yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .options({
      rustPath: {
        alias: 'x',
        type: 'string',
        default: 'src/rules.rs',
        describe: 'Path to write rust to'
      },
      rulesPath: {
        alias: 'r',
        type: 'string',
        default: 'rules.json',
        describe: 'Path to read rules from'
      }
    })
    .alias('h', 'help')
    .parseSync()
}
