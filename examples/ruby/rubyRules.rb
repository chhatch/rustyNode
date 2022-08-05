require_relative "./lib/rust_rules"
require "json"

data = File.read "input.json"
result = rules(data)
puts result