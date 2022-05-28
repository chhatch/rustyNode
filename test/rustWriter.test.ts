import { dataStructure } from '../src/ruleParser/parseExpression'
import { buildRustStruct, compileRust } from '../src/rustWriter'
import { DataStructure, ParsedRule } from '../src/types'

describe('buildRustStruct', () => {
  it('should build a rust struct', () => {
    const dataStructure = {
      node: { type: 'boolean', mutable: false },
      rust: { type: 'string', mutable: true },
      ruby: { type: 'number', mutable: true },
      day_of_week: { type: 'string', mutable: false },
      price: { type: 'number', mutable: true }
    } as DataStructure

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
`)
  })
})

describe('compileRust', () => {
  it('should generate a rust file', () => {
    const rules = [
      {
        if: {
          lhs: 'node',
          operator: '==',
          rhs: 'true',
          rustString: 'parsed_data.node == true'
        },
        then: {
          lhs: 'rust',
          operator: '=',
          rhs: "'win'",
          rustString: 'parsed_data.rust = "win".to_string()'
        },
        else: {
          lhs: 'ruby',
          operator: '=',
          rhs: '1337',
          rustString: 'parsed_data.ruby = 1337'
        }
      },
      {
        if: {
          lhs: 'parsed_data.day_of_week',
          operator: '!=',
          rhs: "'Friday'",
          rustString: 'parsed_data.day_of_week != "Friday".to_string()'
        },
        then: {
          lhs: 'price',
          operator: '=',
          rhs: '15',
          rustString: 'parsed_data.price = 15'
        }
      }
    ] as ParsedRule[]

    const mockDataStructure: DataStructure = {
      node: {
        type: 'boolean',
        mutable: false
      },
      rust: {
        type: 'string',
        mutable: false
      },
      ruby: {
        type: 'number',
        mutable: false
      },
      day_of_week: {
        type: 'string',
        mutable: false
      },
      price: {
        type: 'number',
        mutable: false
      }
    } as DataStructure

    jest.mock('../src/ruleParser/parseExpression')
    Object.entries(mockDataStructure).forEach(
      // @ts-ignore
      ([key, value]: [key, value]) => {
        dataStructure[key] = value
      }
    )
    console.log(dataStructure)
    expect(compileRust(rules)).toMatchSnapshot()
  })
})
