# What's going on here?

In this example we place the generated rust function inside a rust project that will allow us to compile it to ruby-friendly C.

## Installation Prereqs

- yarn
- ruby (I'm using 3.1.2)
- rust (1.61.0)
- cargo
- bundler gem
  - `gem install bundler`

## Install and Run

Using yarn to run rake tasks, it's a beautiful thing :P

- `yarn rulesToRust --rustPath ext/rust_rules/src/rules.rs`
- `yarn buildRuby` There's a bit of mystery because I'm not totally sure how this ends up compiling our rust source for us.
- `yarn runRuby`
  - `yarn formatRust` is nice if you want to inspect the rust generated

That's it. If everyhthing went well the resulting json should be printed to the console.
