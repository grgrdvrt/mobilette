import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";
import { binop, monop, vecop, num, arr } from "../instructionHelpers";
import { lerp, map } from "../../utils";

export const maths: Module = {
  "+": vecop((a, b) => a + b),
  "-": vecop((a, b) => a - b),
  "*": vecop((a, b) => a * b),
  "/": vecop((a, b) => a / b),
  "%": vecop((a, b) => a % b),
  "**": vecop((a, b) => Math.pow(a, b)),
  min: [binop((a, b) => Math.min(a, b))],
  max: [binop((a, b) => Math.max(a, b))],
  sqrt: [
    monop(Math.sqrt),
    monop((v) => v.map(Math.sqrt), [types.ARRAY, types.ARRAY]),
  ],
  sin: [monop(Math.sin)],
  cos: [monop(Math.cos)],
  tan: [monop(Math.tan)],
  asin: [monop(Math.asin)],
  acos: [monop(Math.acos)],
  atan: [monop(Math.atan)],
  exp: [monop(Math.exp)],
  log: [monop(Math.log)],
  round: [
    monop(Math.round),
    monop((v) => v.map(Math.round), [types.ARRAY, types.ARRAY]),
  ],
  ceil: [
    monop(Math.ceil),
    monop((v) => v.map(Math.ceil), [types.ARRAY, types.ARRAY]),
  ],
  floor: [
    monop(Math.floor),
    monop((v) => v.map(Math.floor), [types.ARRAY, types.ARRAY]),
  ],
  random: [
    {
      params: [num, num, num],
      effect: (params, env) => {
        const [min, max] = params.slice(0, 2).map(env.readVal, env);
        env.setVal(params[2].content, lerp(min, max, Math.random()));
      },
    },
  ],
  lerp: [
    {
      params: [num, num, num, num],
      effect: (params, env) => {
        const [a, b, t] = params.slice(0, 3).map(env.readVal, env);
        env.setVal(params[3].content, lerp(a, b, t));
      },
    },
    {
      params: [arr, arr, num, arr],
      effect: (params, env) => {
        const [a, b, t] = params.slice(0, 3).map(env.readVal, env);
        env.setVal(
          params[3].content,
          a.map((_v: number, i: number) => lerp(a[i], b[i], t)),
        );
      },
    },
    {
      params: [arr, arr, arr, arr],
      effect: (params, env) => {
        const [a, b, t] = params.slice(0, 3).map(env.readVal, env);
        env.setVal(
          params[3].content,
          a.map((_v: number, i: number) => lerp(a[i], b[i], t[i])),
        );
      },
    },
  ],
  map: [
    {
      params: [num, num, num, num, num, num],
      effect: (params, env) => {
        const [a, b, c, d, t] = params.slice(0, 5).map(env.readVal, env);
        env.setVal(params[5].content, map(a, b, c, d, t));
      },
    },
  ],
};
