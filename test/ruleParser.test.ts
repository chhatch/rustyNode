import { parseRules } from "../src/ruleParser";

describe("parseRules", () => {
  it("should parse rules", () => {
    const rules = [
      { if: "node == true", then: "rust = 'win'", else: "ruby = 1337" },
      { if: "day_of_week != 'Friday'", then: "price = 15" },
    ];
    const result = [
      {
        else: { lhs: "ruby", operator: "=", rhs: "1337" },
        if: { lhs: "node", operator: "==", rhs: "true" },
        then: { lhs: "rust", operator: "=", rhs: "'win'" },
      },
      {
        if: { lhs: "day_of_week", operator: "!=", rhs: "'Friday'" },
        then: { lhs: "price", operator: "=", rhs: "15" },
      },
    ];
    expect(parseRules(rules)).toEqual(result);
  });
});
