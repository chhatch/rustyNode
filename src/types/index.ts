export interface ParsedRule {
  [key: string]: {
    lhs: string;
    operator: string;
    rhs: string;
    rustString: string;
  };
}

export type DataTypesEnum = "number" | "boolean" | "string";

export interface DataStructure {
  [key: string]: { type: DataTypesEnum; mutable: boolean };
}
