import { DataTypesEnum } from '../types'

export const operatorDict: Record<
  string,
  Record<'resultType', DataTypesEnum>
> = {
  '=': { resultType: 'unknown' },
  '==': { resultType: 'unknown' },
  '!=': { resultType: 'unknown' },
  ',': { resultType: 'unknown' },
  '+': { resultType: 'number' },
  '-': { resultType: 'number' },
  NEG: { resultType: 'number' },
  POW: { resultType: 'number' }
}
