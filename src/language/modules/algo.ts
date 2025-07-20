import { types } from "../language";
import type { Module } from "../language";
import { createNoise2D, createNoise3D, createNoise4D } from "simplex-noise";

const noise2D = createNoise2D();
const noise3D = createNoise3D();
const noise4D = createNoise4D();

const num = { type: types.NUMBER };
const arr = { type: types.ARRAY };

export const algo: Module = {
  noise2D: [
    {
      params: [num, num, num],
      effect: (params, env) => {
        env.setVal(
          params[2].content,
          noise2D(env.readVal(params[0]), env.readVal(params[1])),
        );
      },
    },
    {
      params: [arr, num],
      effect: (params, env) => {
        const v = env.readVal(params[0]);
        env.setVal(params[1].content, noise2D(v[0], v[1]));
      },
    },
  ],
  noise3D: [
    {
      params: [num, num, num, num],
      effect: (params, env) => {
        env.setVal(
          params[3].content,
          noise3D(
            env.readVal(params[0]),
            env.readVal(params[1]),
            env.readVal(params[2]),
          ),
        );
      },
    },
  ],
  noise4D: [
    {
      params: [num, num, num, num, num],
      effect: (params, env) => {
        env.setVal(
          params[4].content,
          noise4D(
            env.readVal(params[0]),
            env.readVal(params[1]),
            env.readVal(params[2]),
            env.readVal(params[3]),
          ),
        );
      },
    },
  ],
};
