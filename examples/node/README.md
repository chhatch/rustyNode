# What's going on here?

In this example we place the generated rust function inside a rust project that will allow us to compile it to node-friendly web assembly. We package the web assembly as a module that we can import and use in node.

## Installation Prereqs

- yarn
- node (I'm using 16)
- rust (1.61.0)
- cargo
- wasm-pack
  - `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`

## Install and Run

We have to build the `wasm_rules` module before we can install at the root level.

- `cd wasm_rules`
- `yarn generateRust`
  - `yarn formatRust` is nice if you want to inspect the rust generated
- `yarn buildWasm`

Now we can build the node project

- `cd ../`
- `yarn build`
- `yarn runWasm`

If everyhthing went well the resulting json should be printed to the console.
