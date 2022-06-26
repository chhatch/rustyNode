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
          rustString: 'parsed_data.ruby = 1337.0'
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
          rustString: 'parsed_data.price = 15.0'
        }
      }
    ]
    expect(parseRules(rules)).toEqual(result)
  })

  it('should parse rules with plus operator, +', () => {
    const rule = { if: 'node == true', then: 'rust = 1 + 1' }
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
          rustString: 'parsed_data.rust = 1.0 + 1.0'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
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
          rustString: 'parsed_data.rust = 1.0 - 1.0'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })

  it('should parse rules with negative operator', () => {
    const rule = { if: 'true', then: 'rust = -1.0' }
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
          rhs: '-1.0',
          rustString: 'parsed_data.rust = -1.0'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })

  it('should parse rules with multiplication operator, *', () => {
    const rule = { if: 'node == true', then: 'rust = 1 * 1' }
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
          rustString: 'parsed_data.rust = 1.0 * 1.0'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })

  it('should parse rules with division operator, /', () => {
    const rule = { if: 'node == true', then: 'rust = 1 / 1' }
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
          rustString: 'parsed_data.rust = 1.0 / 1.0'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })

  it('should parse rules with POW function', () => {
    const rule = { if: 'node == true', then: 'rust = POW(2.0, 3.0)' }
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
          rhs: 'POW(2.0,',
          rustString: 'parsed_data.rust = operations::pow(2.0,3.0)'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })

  it('should parse rules with SQRT operator', () => {
    const rule = { if: 'node == true', then: 'rust = SQRT(4)' }
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
          rhs: 'SQRT(4)',
          rustString: 'parsed_data.rust = operations::sqrt(4.0)'
        }
      }
    ]
    expect(parseRules(rule)).toEqual(result)
  })
})
