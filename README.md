# rustyNode

Let's explore using typescript to compile rust from a json template!

## Installation

`yarn install`

## Running

`yarn start`  
This will first run `index.js` which reads a single json rule from `rule.json` and compiles a rust program to run it. Then `cargo` will build the rust code. Finally the rust program will run, reading data from `input.json`, executing the rule on it, and saving the results to `output.json`
