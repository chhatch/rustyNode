# rustyNode

`rulesToRust` a cli app that reads json rules and produces a rust function to execute them against json input.

## Installation Prereqs

- yarn
- node (I'm using 16)

And if you actually want to run the generated code

- rust (1.61.0)
- cargo

## Installation

`yarn install`

## Building

`yarn build` will compile typescript to the dist folder

## Usage

`yarn rulesToRust` - this reads rules from the default location `./rules.json`, produces a rust function to execute the rules, and saves that function in the default location `src/rules.rs`

### options

- `--rulesPath` Path to rules json file. Default: `'rules.json'`
- `--rustPath` Path to write rust to. Default: `'src/rules.rs'`

## Running

Ideas on how to use this tool can be found in the [examples](/examples/) section.

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
- grouping operations with parentheses
  - This might seem strange, but the expression parser evaluates what's inside the parentheses and just returns the result, which is our case is rust.
  - For example `test = 1 - (10 + 5)` evaluates to `parsed_data.test = 1 - 10 + 5` whoops!

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

running `yarn rulesToRust` will generate a rust function that will read `input.json`, executes the rules, and produces this output,

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

running `yarn rulesToRust` will generate a rust function will read `input.json`, execute the rules, and produces this output,

```json
{
  "node": { "fp": [true] },
  "rust": [{ "nail": "win" }]
}
```
