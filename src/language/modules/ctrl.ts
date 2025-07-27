import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";

const num = { type: types.NUMBER };
const bool = { type: types.BOOLEAN };

export const ctrl: Module = {
  if: [{ params: [bool], effect: () => {} }],
  endif: [{ params: [], effect: () => {} }],
  elseif: [{ params: [bool], effect: () => {} }],
  else: [{ params: [], effect: () => {} }],
  for: [{ params: [num, num, num], effect: () => {} }],
  endfor: [{ params: [], effect: () => {} }],
  break: [{ params: [], effect: () => {} }],
  continue: [{ params: [], effect: () => {} }],
};
