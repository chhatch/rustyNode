# What's going on here?

In this example we place the generated rust function inside a "regular" rust project. Nothing fancy here, we just run the rust binary directly. In the future we'll probably want to update this to show how to call it in a bash script to process all the files in a directory or something.

## Installation Prereqs

- yarn
- rust (1.61.0)
- cargo

## Install and Run

- `yarn rulesToRust`
- `yarn buildRust`
  - `yarn formatRust` is nice if you want to inspect the rust generated
- `yarn run rust`

That's it. If everyhthing went well the resulting json should be printed to the console.
