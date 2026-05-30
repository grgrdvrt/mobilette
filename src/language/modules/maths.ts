import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";
import { binop, monop, vecop, num, arr } from "../instructionHelpers";
import { lerp, map } from "../../utils";

export const maths: Module = {
  "+": {
    description: "Adds two numbers, or two vectors element-wise.",
    variants: vecop((a, b) => a + b),
  },
  "-": {
    description: "Subtracts two numbers, or two vectors element-wise.",
    variants: vecop((a, b) => a - b),
  },
  "*": {
    description: "Multiplies two numbers, or two vectors element-wise.",
    variants: vecop((a, b) => a * b),
  },
  "/": {
    description: "Divides two numbers, or two vectors element-wise.",
    variants: vecop((a, b) => a / b),
  },
  "%": {
    description:
      "Computes the remainder of a division, element-wise for vectors.",
    variants: vecop((a, b) => a % b),
  },
  "**": {
    description: "Raises a number to a power, element-wise for vectors.",
    variants: vecop((a, b) => Math.pow(a, b)),
  },
  min: {
    description: "Returns the smaller of two numbers.",
    variants: [binop((a, b) => Math.min(a, b))],
  },
  max: {
    description: "Returns the larger of two numbers.",
    variants: [binop((a, b) => Math.max(a, b))],
  },
  sqrt: {
    description:
      "Computes the square root of a number, or of each element of a vector.",
    variants: [
      monop(Math.sqrt),
      monop((v) => v.map(Math.sqrt), [types.ARRAY, types.ARRAY]),
    ],
  },
  sin: {
    description: "Computes the sine of an angle given in radians.",
    variants: [monop(Math.sin)],
  },
  cos: {
    description: "Computes the cosine of an angle given in radians.",
    variants: [monop(Math.cos)],
  },
  tan: {
    description: "Computes the tangent of an angle given in radians.",
    variants: [monop(Math.tan)],
  },
  asin: {
    description: "Computes the arcsine of a number, returning radians.",
    variants: [monop(Math.asin)],
  },
  acos: {
    description: "Computes the arccosine of a number, returning radians.",
    variants: [monop(Math.acos)],
  },
  atan: {
    description: "Computes the arctangent of a number, returning radians.",
    variants: [monop(Math.atan)],
  },
  exp: {
    description: "Computes e raised to the given power.",
    variants: [monop(Math.exp)],
  },
  log: {
    description: "Computes the natural logarithm of a number.",
    variants: [monop(Math.log)],
  },
  round: {
    description:
      "Rounds a number, or each element of a vector, to the nearest integer.",
    variants: [
      monop(Math.round),
      monop((v) => v.map(Math.round), [types.ARRAY, types.ARRAY]),
    ],
  },
  ceil: {
    description:
      "Rounds a number, or each element of a vector, up to the nearest integer.",
    variants: [
      monop(Math.ceil),
      monop((v) => v.map(Math.ceil), [types.ARRAY, types.ARRAY]),
    ],
  },
  floor: {
    description:
      "Rounds a number, or each element of a vector, down to the nearest integer.",
    variants: [
      monop(Math.floor),
      monop((v) => v.map(Math.floor), [types.ARRAY, types.ARRAY]),
    ],
  },
  random: {
    description: "Returns a random number between the given minimum and maximum.",
    variants: [
      {
        params: [num, num, num],
        effect: (params, env) => {
          const [min, max] = params.slice(0, 2).map(env.readVal, env);
          env.setVal(params[2].content, lerp(min, max, Math.random()));
        },
      },
    ],
  },
  lerp: {
    description:
      "Linearly interpolates between two numbers or vectors by a factor t.",
    variants: [
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
  },
  map: {
    description:
      "Remaps a number from an input range (a, b) to an output range (c, d).",
    variants: [
      {
        params: [num, num, num, num, num, num],
        effect: (params, env) => {
          const [a, b, c, d, t] = params.slice(0, 5).map(env.readVal, env);
          env.setVal(params[5].content, map(a, b, c, d, t));
        },
      },
    ],
  },
};
