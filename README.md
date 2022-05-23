# rustyNode

Let's explore using typescript to compile rust from a json template!

## What's supported right now?

- Only three data types are currently supported, number, string, and boolean.
- Only if/then rules, else is optional.
- If condition can be `==` or `!=`.
- Then and else statements can only perform basic assignment operation, `=`, and the assignment cannot change the datatype.
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

## Installation

`yarn install`

## Building

`yarn build` will compile typescript to the dist folder

## Running

`yarn start`  
This will first run `dist/index.js` which reads a single json rule or array of rules from `rules.json` and compiles a rust program to `node_rust/main.rs` Then `cargo` will format build the rust code. Finally the rust program will run, reading data from `input.json`, executing the rule on it, and saving the results to `output.json`
