import ExpressionParser, {
  ExpressionParserOptions,
  ExpressionThunk,
} from "expressionparser/dist/ExpressionParser";
import { isBoolean } from "lodash";

interface ParsedExpr {
  value: string | number;
  rustString: string;
  type: string;
}

const joinWith =
  (operator: string) => (a: ExpressionThunk, b: ExpressionThunk) => {
    const aParsed = a() as unknown as ParsedExpr;
    const bParsed = b() as unknown as ParsedExpr;
    const resultString = `${aParsed.rustString} ${operator} ${bParsed.rustString}`;
    return parsedTerm(resultString, "done", resultString);
  };
const testLanguage = {
  INFIX_OPS: {
    "+": function (a: ExpressionThunk, b: ExpressionThunk) {
      const aParsed = a() as unknown as ParsedExpr;
      const bParsed = b() as unknown as ParsedExpr;
      if (aParsed.type === "number" && bParsed.type === "number") {
        // @ts-ignore
        const sumString = aParsed.value + bParsed.value;
        return parsedTerm(sumString, "number", String(sumString));
      }
      if (aParsed.type === "variable" || bParsed.type === "variable") {
        const resultString = `${aParsed.rustString} + ${bParsed.rustString}`;
        return parsedTerm(resultString, "done", resultString);
      }
    },
    "=": joinWith("="),
    "==": joinWith("=="),
    "!=": joinWith("!="),
  },
  PREFIX_OPS: {
    POW: function (expr: ExpressionThunk) {
      // @ts-ignore
      return Math.pow(expr()[0], expr()[1]);
    },
  },
  PRECEDENCE: [["SQRT", "POW"], ["*", "/"], ["+", "-"], [","]],
  GROUP_OPEN: "(",
  GROUP_CLOSE: ")",
  SEPARATOR: " ",
  SYMBOLS: ["(", ")", "+", "-", "*", "/", ","],

  AMBIGUOUS: {
    "-": "NEG",
  },

  termDelegate: function (term: string) {
    let rustString;
    let value;
    const type = getType(term);
    switch (type) {
      case "string":
        value = term.replace(/^'/, '"').replace(/'$/, '"');
        rustString = value + ".to_string()";
        break;
      case "number":
        value = parseInt(term);
        rustString = term;
        break;
      case "boolean":
        value = term.toLowerCase() === "true";
        rustString = term.toLowerCase();
        break;
      case "variable":
        value = term;
        rustString = `parsed_data.${term}`;
        break;
      default:
        throw new Error(`Unrecognized term: ${term}`);
    }
    return parsedTerm(value, type, rustString);
  },
};

const expr = "foo = 5 + 3 + bar".toUpperCase();

function getType(value: string) {
  const lc = value.toLocaleLowerCase();
  const isBool = lc == "true" || lc == "false";
  if (/^('|").+\1$/.test(value)) return "string";
  if (isFinite(Number(value))) return "number";
  if (isBool) return "boolean";
  if (typeof value === "string") return "variable";
  throw new Error(`Value type not supported: ${value}`);
}
function parsedTerm(
  value: number | string | boolean,
  type: string,
  rustString: string
) {
  return { rustString, value, type };
}

export const exprToRust = (expr: string): string => {
  const parsedExpr = new ExpressionParser(
    testLanguage as unknown as ExpressionParserOptions
  ).expressionToValue(expr) as unknown as ParsedExpr;
  return parsedExpr.rustString;
};
