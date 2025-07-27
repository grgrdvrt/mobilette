import { types } from "../language";
import type { Module } from "../language";
import { binop, monop } from "../instructionHelpers";

export const vec: Module = {
  v2: [
    {
      params: [
        { type: types.NUMBER },
        { type: types.NUMBER },
        { type: types.ARRAY },
      ],
      effect: (params, env) => {
        env.setVal(params[2].content, [
          env.readVal(params[0]),
          env.readVal(params[1]),
        ]);
      },
    },
  ],
  polar: [
    {
      params: [
        { type: types.NUMBER },
        { type: types.NUMBER },
        { type: types.ARRAY },
      ],
      effect: (params, env) => {
        const a = env.readVal(params[0]);
        const r = env.readVal(params[1]);
        env.setVal(params[2].content, [r * Math.cos(a), r * Math.sin(a)]);
      },
    },
  ],
  dist: [
    binop(
      (a, b) => {
        return Math.hypot(...a.map((c: number, i: number) => c - b[i]));
      },
      [types.ARRAY, types.ARRAY, types.NUMBER],
    ),
  ],
  getLen: [monop((v) => Math.hypot(...v), [types.ARRAY, types.NUMBER])],
  setLen: [
    binop(
      (v, l) => {
        const r = l / Math.hypot(...v);
        return v.map((c: number) => c * r);
      },
      [types.ARRAY, types.NUMBER, types.ARRAY],
    ),
  ],
  dot: [
    binop(
      (a, b) => {
        return a.reduce((t: number, c: number, i: number) => t + c * b[i]);
      },
      [types.ARRAY, types.ARRAY, types.NUMBER],
    ),
  ],
  rotate: [
    binop(
      (v, a) => {
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        return [ca * v[0] - sa * v[1], sa * v[0] + ca * v[1]];
      },
      [types.ARRAY, types.NUMBER, types.ARRAY],
    ),
  ],
  cross2: [
    binop(
      (a, b) => {
        return a[0] * b[1] - a[1] * b[0];
      },
      [types.ARRAY, types.ARRAY, types.NUMBER],
    ),
  ],
  cross3: [
    binop(
      (a, b) => {
        return [
          a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0],
        ];
      },
      [types.ARRAY, types.ARRAY, types.ARRAY],
    ),
  ],
};
