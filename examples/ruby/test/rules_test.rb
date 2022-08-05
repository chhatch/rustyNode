# frozen_string_literal: true

require "test/unit"
require_relative "../lib/rust_rules"

class RulesTest < Test::Unit::TestCase
  def test_rules?

    expected = '{"node":{"fp":[true]},"rust":[{"nail":5.0}],"ruby":5.0,"day_of_week":"Wednesday","fee":2.0,"price":100.0}'
    actual = rules('{"node": { "fp": [true] },  "rust": [{ "nail": 3 }],  "ruby": 5,  "day_of_week": "Wednesday",  "price": 10,  "fee": 2}').gsub(/\s+/, "")

    assert_equal(expected, actual)
  end

end
