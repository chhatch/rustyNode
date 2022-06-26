import { parseRules } from '../src/ruleParser'
import { dataStructure } from '../src/ruleParser/parseExpression'

describe('parseRules', () => {
  beforeEach(() => {
    // @ts-ignore shared mutable state FTW!!
    dataStructure = {}
  })
  it('should parse rules', () => {
    const rules = [
      { if: 'node == true', then: "rust = 'win'", else: 'ruby = 1337' },
      { if: "day_of_week != 'Friday'", then: 'price = 15' }
    ]
    const result = [
      {
        else: {
          lhs: 'ruby',
          operator: '=',
          rhs: '1337',
          rustString: 'parsed_data.ruby = 1337'
        },
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
        }
      },
      {
        if: {
          lhs: 'day_of_week',
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
    ]
    expect(parseRules(rules)).toEqual(result)
  })

  it('should parse rules with minus operator, -', () => {
    const rule = { if: 'node == true', then: 'rust = 1 - 1' }
    const result = [
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
          rhs: '1',
          rustString: 'parsed_data.rust = 1 - 1'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })

  it('should parse rules with negative operator', () => {
    const rule = { if: 'true', then: 'rust = -1' }
    const result = [
      {
        if: {
          lhs: 'true',
          operator: undefined,
          rhs: undefined,
          rustString: 'true'
        },
        then: {
          lhs: 'rust',
          operator: '=',
          rhs: '-1',
          rustString: 'parsed_data.rust = -1'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })
})
