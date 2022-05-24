import {
  buildRustStruct,
  compileRust,
  generateDataStructure,
} from "../src/rustWriter";
import { DataStructure, ParsedRule } from "../src/types";

describe("generateDataStructure", () => {
  it("should generate the data structure", () => {
    const rules = [
      {
        else: { lhs: "ruby", operator: "=", rhs: "1337" },
        if: { lhs: "node", operator: "==", rhs: "true" },
        then: { lhs: "rust", operator: "=", rhs: "'win'" },
      },
      {
        if: { lhs: "day_of_week", operator: "!=", rhs: "'Friday'" },
        then: { lhs: "price", operator: "=", rhs: "15" },
      },
    ] as ParsedRule[];

    const result = {
      node: { type: "boolean", mutable: false },
      rust: { type: "string", mutable: true },
      ruby: { type: "number", mutable: true },
      day_of_week: { type: "string", mutable: false },
      price: { type: "number", mutable: true },
    };

    expect(generateDataStructure(rules)).toEqual(result);
  });
});

describe("buildRustStruct", () => {
  it("should build a rust struct", () => {
    const dataStructure = {
      node: { type: "boolean", mutable: false },
      rust: { type: "string", mutable: true },
      ruby: { type: "number", mutable: true },
      day_of_week: { type: "string", mutable: false },
      price: { type: "number", mutable: true },
    } as DataStructure;

    expect(buildRustStruct(dataStructure)).toMatchInlineSnapshot(`
"#[derive(Deserialize, Debug, Serialize)]
struct Data {
node: bool,
rust: String,
ruby: i32,
day_of_week: String,
price: i32,
}
"
`);
  });
});

describe("compileRust", () => {
  it("should generate a rust file", () => {
    const rules = [
      {
        else: { lhs: "ruby", operator: "=", rhs: "1337" },
        if: { lhs: "node", operator: "==", rhs: "true" },
        then: { lhs: "rust", operator: "=", rhs: "'win'" },
      },
      {
        if: { lhs: "day_of_week", operator: "!=", rhs: "'Friday'" },
        then: { lhs: "price", operator: "=", rhs: "15" },
      },
    ] as ParsedRule[];

    expect(compileRust(rules)).toMatchSnapshot();
  });
});
