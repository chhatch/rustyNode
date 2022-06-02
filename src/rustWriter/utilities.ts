import { isArray, isObject } from 'lodash'
import { DataStructure, DataStructureArray, DataType } from '../types'

export const rustStruct = (
  structName: string,
  struct: string,
  nestedTypes: string[]
): string => `#[derive(Deserialize, Debug, Serialize)]
struct ${structName} {
${struct}
}
${nestedTypes.join('')}`

type BuilderType = {
  key: string
  type: string
}
export const rustVecType = ({ type }: BuilderType) => `Vec<${type}>;
`
export const rustStructType = ({ key, type }: BuilderType) => `${key}: ${type},
`
export const hasPropTypeFn = (x: { key: string; prop: any }) => {
  // @ts-ignore
  const hasPropType = 'type' in x.prop && typeof x.prop.type === 'string'
  return { ...x, hasPropType }
}

export const isFinalKey = (x: { key: string; prop: any }) => {
  const isFinalKey =
    isFinite(Number(x.key)) && isObject(x.prop) && !isArray(x.prop)
  return { ...x, isFinalKey }
}

export interface FlowArgs {
  key: string
  prop: DataStructure | DataStructureArray | DataType
  type?: string
  hasPropType?: boolean
  isFinalKey?: boolean
}
