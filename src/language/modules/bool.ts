import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";
import { binop, comp, monop } from "../instructionHelpers";

export const bool: Module = {
  "==": {
    description: "Returns true when the two values are equal.",
    variants: [comp((a, b) => a == b)],
  },
  ">=": {
    description:
      "Returns true when the first value is greater than or equal to the second.",
    variants: [comp((a, b) => a >= b)],
  },
  "<=": {
    description:
      "Returns true when the first value is less than or equal to the second.",
    variants: [comp((a, b) => a <= b)],
  },
  ">": {
    description: "Returns true when the first value is greater than the second.",
    variants: [comp((a, b) => a > b)],
  },
  "<": {
    description: "Returns true when the first value is less than the second.",
    variants: [comp((a, b) => a < b)],
  },
  "&&": {
    description: "Logical and: returns true when both values are true.",
    variants: [
      binop((a, b) => a && b, [types.BOOLEAN, types.BOOLEAN, types.BOOLEAN]),
    ],
  },
  "||": {
    description: "Logical or: returns true when either value is true.",
    variants: [
      binop((a, b) => a || b, [types.BOOLEAN, types.BOOLEAN, types.BOOLEAN]),
    ],
  },
  "!": {
    description: "Logical not: returns the negation of a boolean.",
    variants: [monop((v) => !v, [types.BOOLEAN, types.BOOLEAN])],
  },
};
