import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";

const num = { type: types.NUMBER };
const bool = { type: types.BOOLEAN };

export const ctrl: Module = {
  if: {
    description: "Runs the following block only if the condition is true.",
    variants: [{ params: [bool], effect: () => {} }],
  },
  endif: {
    description: "Marks the end of an if block.",
    variants: [{ params: [], effect: () => {} }],
  },
  elseif: {
    description:
      "Runs its block when the previous conditions were false and this condition is true.",
    variants: [{ params: [bool], effect: () => {} }],
  },
  else: {
    description: "Runs its block when all previous conditions were false.",
    variants: [{ params: [], effect: () => {} }],
  },
  for: {
    description:
      "Repeats the following block over a range of values (start, end, step).",
    variants: [{ params: [num, num, num], effect: () => {} }],
  },
  endfor: {
    description: "Marks the end of a for loop.",
    variants: [{ params: [], effect: () => {} }],
  },
  break: {
    description: "Exits the current loop immediately.",
    variants: [{ params: [], effect: () => {} }],
  },
  continue: {
    description: "Skips to the next iteration of the current loop.",
    variants: [{ params: [], effect: () => {} }],
  },
};
