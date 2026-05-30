import { types } from "../language";
import type { Module } from "../language";
import { binop, monop } from "../instructionHelpers";

export const vec: Module = {
  v2: {
    description: "Builds a 2D vector from x and y components.",
    variants: [
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
  },
  polar: {
    description: "Builds a 2D vector from an angle and a radius.",
    variants: [
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
  },
  dist: {
    description: "Computes the distance between two vectors.",
    variants: [
      binop(
        (a, b) => {
          return Math.hypot(...a.map((c: number, i: number) => c - b[i]));
        },
        [types.ARRAY, types.ARRAY, types.NUMBER],
      ),
    ],
  },
  getLen: {
    description: "Returns the length (magnitude) of a vector.",
    variants: [monop((v) => Math.hypot(...v), [types.ARRAY, types.NUMBER])],
  },
  setLen: {
    description: "Returns the vector rescaled to the given length.",
    variants: [
      binop(
        (v, l) => {
          const r = l / Math.hypot(...v);
          return v.map((c: number) => c * r);
        },
        [types.ARRAY, types.NUMBER, types.ARRAY],
      ),
    ],
  },
  dot: {
    description: "Computes the dot product of two vectors.",
    variants: [
      binop(
        (a, b) => {
          return a.reduce((t: number, c: number, i: number) => t + c * b[i]);
        },
        [types.ARRAY, types.ARRAY, types.NUMBER],
      ),
    ],
  },
  rotate: {
    description: "Rotates a 2D vector by the given angle in radians.",
    variants: [
      binop(
        (v, a) => {
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          return [ca * v[0] - sa * v[1], sa * v[0] + ca * v[1]];
        },
        [types.ARRAY, types.NUMBER, types.ARRAY],
      ),
    ],
  },
  cross2: {
    description: "Computes the 2D cross product (a scalar) of two vectors.",
    variants: [
      binop(
        (a, b) => {
          return a[0] * b[1] - a[1] * b[0];
        },
        [types.ARRAY, types.ARRAY, types.NUMBER],
      ),
    ],
  },
  cross3: {
    description: "Computes the 3D cross product (a vector) of two vectors.",
    variants: [
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
  },
};
