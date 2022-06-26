# hey you!

Just in case you actually want to set up this project, I think there's a bit of a chicken-and-egg problem with building it from scratch.
The wasm stuff is imported as a node module. We need it for the project to build but it gets build by the project. _shrugs_

# rustyNode

Let's explore using typescript to compile rust from a json template!

## Installation Prereqs

- yarn
- node (I'm using 16)
- rust (1.61.0)
- cargo
- wasm-pack
  - `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
- probably some other stuff
  Instructions for installing

## Installation

`yarn install`

## Building

`yarn build` will compile typescript to the dist folder

## Running

`yarn rustChain`  
 This will first run `dist/index.js` which reads a single json rule or array of rules from `rules.json` and compiles a rust program to `node_rust/lib.rs` Then `cargo` will format the rust code. Finally the rust program will run, reading data from `input.json`, executing the rules on it, and saving the results to `output.json`

`yarn wasmChain`  
 This will first run `dist/index.js` which reads a single json rule or array of rules from `rules.json` and compiles a rust program to `node_rust/lib.rs` Then `cargo` will format the rust code. `wasm-pack` then compiles our rust to web assembly. The next step is awkward. We have to do and `yarn install` again!
The wasm code we generated is going to be used in a node module, so we have to install after the rules are converted to rust. Finally, `dist/wasmRules.js` is run reading data from `input.json`, executing the rules on it, and saving the results to `output.json`

## What's supported?

- Only three data literal types are currently supported, number, string, and boolean.
  - number types are 64 bit floats.
- Variables can be prmitives, objects, or arrays
- Only if/then rules, else is optional.
- ==, !=, =, +, -(minus and negative), \*, /, POW, and SQRT
- assignment operations cannot change datatype.
- Object nesting
- Single rules or arrays of rules can be processed, e.g.

```json
{ "if": "node == true", "then": "rust = 'win'", "else": "ruby = 1337" },
```

```json
[
  { "if": "node == true", "then": "rust = 'win'", "else": "ruby = 1337" },
  { "if": "dayOfWeek != 'Friday'", "then": "price = 15" }
]
```

## What's not supported?

- Object and array literals
- nested arrays

## Simple Example

Given this `rules.json`,

```json
[
  { "if": "node == true", "then": "rust = 'win'", "else": "ruby = 1337" },
  { "if": "day_of_week != 'Friday'", "then": "price = 15" }
]
```

and this `input.json`,

```json
{
  "node": false,
  "rust": "meh",
  "ruby": 5,
  "day_of_week": "Wednesday",
  "price": 10
}
```

running `yarn start` will generate and run a rust program that reads `input.json`, executes the rules, and produces this `output.json`,

```json
{
  "node": false,
  "rust": "meh",
  "ruby": 1337.0,
  "day_of_week": "Wednesday",
  "price": 15.0
}
```

## More Complex Example

Given this `rules.json`,

```json
{
  "if": "node.fp[0] == true",
  "then": "rust[0].nail = 'win'"
}
```

and this `input.json`,

```json
{
  "node": { "fp": [true] },
  "rust": [{ "nail": "meh" }]
}
```

running `yarn start` will generate and run a rust program that reads `input.json`, executes the rules, and produces this `output.json`,

```json
{
  "node": { "fp": [true] },
  "rust": [{ "nail": "win" }]
}
```
