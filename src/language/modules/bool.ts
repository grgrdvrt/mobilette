import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";
import { binop, comp, monop } from "../instructionHelpers";

export const bool: Module = {
  "==": [comp((a, b) => a == b)],
  ">=": [comp((a, b) => a >= b)],
  "<=": [comp((a, b) => a <= b)],
  ">": [comp((a, b) => a > b)],
  "<": [comp((a, b) => a < b)],
  "&&": [
    binop((a, b) => a && b, [types.BOOLEAN, types.BOOLEAN, types.BOOLEAN]),
  ],
  "||": [
    binop((a, b) => a || b, [types.BOOLEAN, types.BOOLEAN, types.BOOLEAN]),
  ],
  "!": [monop((v) => !v, [types.BOOLEAN, types.BOOLEAN])],
};
