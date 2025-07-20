import { types } from "../instructionHelpers";
import type { Module } from "../instructionHelpers";

export const registers: Module = {
  set: [
    {
      params: [{ type: types.ANY }, { type: types.ANY }],
      effect: (params, env) =>
        env.setVal(params[0].content, env.readVal(params[1])),
    },
    {
      params: [
        { type: types.ARRAY },
        { type: types.NUMBER },
        { type: types.ANY },
      ],
      effect: (params, env) => {
        env.readVal(params[0])[env.readVal(params[1])] = env.readVal(params[2]);
      },
    },
    {
      params: [
        { type: types.COLOR },
        { type: types.NUMBER },
        { type: types.ANY },
      ],
      effect: (params, env) => {
        env.readVal(params[0])[env.readVal(params[1])] = env.readVal(params[2]);
      },
    },
  ],
  print: [
    {
      params: [{ type: types.ANY, variadic: true }],
      effect: (params, env) => {
        const paramsStr = params
          .map((param) => {
            switch (param.type) {
              case "value":
                return `[${env.readVal(param)}]`;
                break;
              case "register":
                const register = env.getReg(param.content);
                return `[${register.name || register.y + ":" + register.x} ${register.value}]`;
                break;
            }
          })
          .join(" ");
        env.log(`${env.instructionId}: ${paramsStr}`);
      },
    },
  ],
  get: [
    {
      params: [
        { type: types.ARRAY },
        { type: types.NUMBER },
        { type: types.ANY },
      ],
      effect: (params, env) => {
        env.setVal(
          params[2].content,
          env.readVal(params[0])[env.readVal(params[1])],
        );
      },
    },
    {
      params: [
        { type: types.COLOR },
        { type: types.NUMBER },
        { type: types.ANY },
      ],
      effect: (params, env) => {
        env.setVal(
          params[2].content,
          env.readVal(params[0])[env.readVal(params[1])],
        );
      },
    },
  ],
  pack: [
    {
      params: [{ type: types.ARRAY }, { type: types.ANY, variadic: true }],
      effect: (params, env) => {
        const arr = env.readVal(params[0]);
        arr.length = 0;
        for (let i = 1; i < params.length; i++) {
          arr.push(env.readVal(params[i]));
        }
      },
    },
    {
      params: [{ type: types.COLOR }, { type: types.ANY, variadic: true }],
      effect: (params, env) => {
        const arr = env.readVal(params[0]);
        arr.length = 0;
        for (let i = 1; i < params.length; i++) {
          arr.push(env.readVal(params[i]));
        }
      },
    },
  ],
  unpack: [
    {
      params: [{ type: types.ARRAY }, { type: types.ANY, variadic: true }],
      effect: (params, env) => {
        const arr = env.readVal(params[0]);
        for (let i = 0; i < arr.length; i++) {
          env.setVal(params[i + 1].content, arr[i]);
        }
      },
    },
    {
      params: [{ type: types.COLOR }, { type: types.ANY, variadic: true }],
      effect: (params, env) => {
        const arr = env.readVal(params[0]);
        for (let i = 0; i < arr.length; i++) {
          env.setVal(params[i + 1].content, arr[i]);
        }
      },
    },
  ],
};
