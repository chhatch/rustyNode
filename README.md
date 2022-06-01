# rustyNode

Let's explore using typescript to compile rust from a json template!

## Installation

`yarn install`

## Building

`yarn build` will compile typescript to the dist folder

## Running

`yarn start`  
 This will first run `dist/index.js` which reads a single json rule or array of rules from `rules.json` and compiles a rust program to `node_rust/main.rs` Then `cargo` will format build the rust code. Finally the rust program will run, reading data from `input.json`, executing the rule on it, and saving the results to `output.json`

## What's supported?

- Only three data literal types are currently supported, number, string, and boolean.
- Variables can be prmitives, objects, or arrays
- Only if/then rules, else is optional.
- ==, !=, =, +, POW
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
  "ruby": 1337,
  "day_of_week": "Wednesday",
  "price": 15
}
```

## More COmplex Example

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
