import { RegisterId } from "../store";
import type { Interpreter } from "./interpreter";

export type ParamDefinition = {
  type: number;
  optional?: boolean;
  variadic?: boolean;
};

export type ParamInput =
  | { type: "register"; content: RegisterId }
  | { type: "value"; content: any };

export type InstructionVariant = {
  params: ParamDefinition[];
  effect: (params: ParamInput[], env: Interpreter) => void;
};

export type InstructionDefinition = InstructionVariant[];

export type Module = Record<string, InstructionDefinition>;

export const types = {
  ANY: -1,
  BOOLEAN: 0,
  NUMBER: 1,
  STRING: 2,
  ARRAY: 3,
  COLOR: 4,
};

export const typesNames = {
  [types.ANY]: "Any",
  [types.BOOLEAN]: "Boolean",
  [types.NUMBER]: "Number",
  [types.STRING]: "String",
  [types.ARRAY]: "Array",
  [types.COLOR]: "Color",
};

export const defaultValues = {
  [types.ANY]: () => 0,
  [types.BOOLEAN]: () => 1,
  [types.NUMBER]: () => 0,
  [types.STRING]: () => "",
  [types.ARRAY]: () => [],
  [types.COLOR]: () => [0, 100, 50, 1],
};

const num = { type: types.NUMBER };
const bool = { type: types.BOOLEAN };
const arr = { type: types.ARRAY };

export function binop(
  func: (a: any, b: any) => any,
  paramsTypes = [types.NUMBER, types.NUMBER, types.NUMBER],
): InstructionVariant {
  return {
    params: [
      { type: paramsTypes[0] },
      { type: paramsTypes[1] },
      { type: paramsTypes[2], optional: true },
    ],
    effect: (params, env) => {
      env.setVal(
        (params.length === 3 ? params[2] : params[0]).content,
        func(env.readVal(params[0]), env.readVal(params[1])),
      );
    },
  };
}

export function monop(
  func: (a: any) => any,
  paramsTypes = [types.NUMBER, types.NUMBER],
): InstructionVariant {
  return {
    params: [
      { type: paramsTypes[0] },
      { type: paramsTypes[1], optional: true },
    ],
    effect: (params, env) => {
      env.setVal(
        (params.length === 2 ? params[1] : params[0]).content,
        func(env.readVal(params[0])),
      );
    },
  };
}

export function vecop(func: (a: any, b: any) => any): InstructionDefinition {
  return [
    binop((a, b) => func(a, b)),
    binop(
      (a, b) => b.map((v: number) => func(v, a)),
      [types.NUMBER, types.ARRAY, types.ARRAY],
    ),
    binop(
      (a, b) => a.map((v: number) => func(v, b)),
      [types.ARRAY, types.NUMBER, types.ARRAY],
    ),
    binop(
      (a, b) => a.map((v: number, i: number) => func(v, b[i])),
      [types.ARRAY, types.ARRAY, types.ARRAY],
    ),
  ];
}

export function comp(func: (a: any, b: any) => boolean): InstructionVariant {
  return {
    params: [num, num, bool],
    effect: (params, env) => {
      env.setVal(
        params[2].content,
        func(env.readVal(params[0]), env.readVal(params[1])) ? 1 : 0,
      );
    },
  };
}

export { num, bool, arr };
