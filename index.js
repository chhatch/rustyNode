import { readFileSync, writeFileSync } from "fs";

const rules = JSON.stringify(readFileSync("rules.json", "utf8"));
writeFileSync(
  "node_rust/src/main.rs",
  `fn main() {
    println!("Hello, rustyNode!");
}`
);
