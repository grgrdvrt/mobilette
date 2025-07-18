import { createNoise2D, createNoise3D, createNoise4D } from "simplex-noise";
import { Interpreter } from "./interpreter";
import { hsla, lerp, map } from "../utils";
const noise2D = createNoise2D();
const noise3D = createNoise3D();
const noise4D = createNoise4D();

export type ParamDefinition = {
  type: number;
  optional?: boolean;
  variadic?: boolean;
};
export type ParamInput = { type: "register" | "value"; content: any };
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
function binop(
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

function monop(
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

function vecop(func: (a: any, b: any) => any): InstructionDefinition {
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

function comp(func: (a: any, b: any) => boolean): InstructionVariant {
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

export const instructionsDefinitions: Record<string, Module> = {
  registers: {
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
          env.readVal(params[0])[env.readVal(params[1])] = env.readVal(
            params[2],
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
          env.readVal(params[0])[env.readVal(params[1])] = env.readVal(
            params[2],
          );
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
  },
  ctrl: {
    if: [{ params: [bool], effect: () => {} }],
    endif: [{ params: [], effect: () => {} }],
    else: [{ params: [], effect: () => {} }],
    for: [{ params: [num, num, num], effect: () => {} }],
    endfor: [{ params: [], effect: () => {} }],
    break: [{ params: [], effect: () => {} }],
    continue: [{ params: [], effect: () => {} }],
  },
  maths: {
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
  },
  bool: {
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
  },
  gfx: {
    clear: [
      {
        params: [],
        effect: (_, env) => {
          const w = env.readVal({ type: "register", content: "width" });
          const h = env.readVal({ type: "register", content: "height" });
          env.ctx.save();
          env.ctx.fillStyle = "white";
          env.ctx.fillRect(0, 0, w, h);
          env.ctx.restore();
        },
      },
      {
        params: [{ type: types.COLOR }],
        effect: (params, env) => {
          const w = env.readVal({ type: "register", content: "width" });
          const h = env.readVal({ type: "register", content: "height" });
          env.ctx.save();
          env.ctx.fillStyle = hsla(env.readVal(params[0]));
          env.ctx.fillRect(0, 0, w, h);
          env.ctx.restore();
        },
      },
    ],
    beginPath: [
      {
        params: [],
        effect: (_, env) => {
          env.ctx.beginPath();
        },
      },
    ],
    moveTo: [
      {
        params: [num, num],
        effect: (params, env) => {
          env.ctx.moveTo(env.readVal(params[0]), env.readVal(params[1]));
        },
      },
      {
        params: [arr],
        effect: (params, env) => {
          const v = env.readVal(params[0]);
          env.ctx.moveTo(v[0], v[1]);
        },
      },
    ],
    lineTo: [
      {
        params: [num, num],
        effect: (params, env) => {
          env.ctx.lineTo(env.readVal(params[0]), env.readVal(params[1]));
        },
      },
      {
        params: [arr],
        effect: (params, env) => {
          const v = env.readVal(params[0]);
          env.ctx.lineTo(v[0], v[1]);
        },
      },
    ],
    curve2: [
      {
        params: [num, num, num, num],
        effect: (params, env) => {
          const [cx, cy, x, y] = params.map(env.readVal, env);
          env.ctx.quadraticCurveTo(cx, cy, x, y);
        },
      },
      {
        params: [arr, arr],
        effect: (params, env) => {
          const c = env.readVal(params[0]);
          const p = env.readVal(params[1]);
          env.ctx.quadraticCurveTo(c[0], c[1], p[0], p[1]);
        },
      },
    ],
    curve3: [
      {
        params: [num, num, num, num, num, num],
        effect: (params, env) => {
          const [c1x, c1y, c2x, c2y, x, y] = params.map(env.readVal, env);
          env.ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
        },
      },
      {
        params: [arr, arr, arr],
        effect: (params, env) => {
          const c1 = env.readVal(params[0]);
          const c2 = env.readVal(params[1]);
          const p = env.readVal(params[2]);
          env.ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p[0], p[1]);
        },
      },
    ],
    rect: [
      {
        params: [num, num, num, num],
        effect: (params, env) => {
          const [x, y, w, h] = params.map(env.readVal, env);
          env.ctx.moveTo(x, y);
          env.ctx.lineTo(x + w, y);
          env.ctx.lineTo(x + w, y + h);
          env.ctx.lineTo(x, y + h);
          env.ctx.lineTo(x, y);
        },
      },
      {
        params: [arr, arr],
        effect: (params, env) => {
          const p1 = env.readVal(params[0]);
          const p2 = env.readVal(params[1]);
          env.ctx.moveTo(p1[0], p1[1]);
          env.ctx.lineTo(p2[0], p1[1]);
          env.ctx.lineTo(p2[0], p2[1]);
          env.ctx.lineTo(p1[0], p2[1]);
          env.ctx.lineTo(p1[0], p1[1]);
        },
      },
    ],
    circle: [
      {
        params: [num, num, num],
        effect: (params, env) => {
          const [x, y, r] = params.map(env.readVal, env);
          env.ctx.moveTo(x + r, y);
          env.ctx.arc(x, y, r, 0, 2 * Math.PI);
        },
      },
      {
        params: [arr, num],
        effect: (params, env) => {
          const c = env.readVal(params[0]);
          const r = env.readVal(params[1]);
          env.ctx.moveTo(c[0] + r, c[1]);
          env.ctx.arc(c[0], c[1], r, 0, 2 * Math.PI);
        },
      },
    ],
    square: [
      {
        params: [num, num, num],
        effect: (params, env) => {
          const [x, y, s] = params.map(env.readVal, env);
          const hs = s / 2;
          env.ctx.moveTo(x - hs, y - hs);
          env.ctx.lineTo(x + hs, y - hs);
          env.ctx.lineTo(x + hs, y + hs);
          env.ctx.lineTo(x - hs, y + hs);
          env.ctx.lineTo(x - hs, y - hs);
        },
      },
      {
        params: [arr, num],
        effect: (params, env) => {
          const c = env.readVal(params[0]);
          const s = env.readVal(params[1]);
          const hs = s / 2;
          env.ctx.moveTo(c[0] - hs, c[1] - hs);
          env.ctx.lineTo(c[0] + hs, c[1] - hs);
          env.ctx.lineTo(c[0] + hs, c[1] + hs);
          env.ctx.lineTo(c[0] - hs, c[1] + hs);
          env.ctx.lineTo(c[0] - hs, c[1] - hs);
        },
      },
    ],
    arc: [
      {
        params: [num, num, num, num, num, num],
        effect: (params, env) => {
          const [x, y, r, a1, a2, d] = params.map(env.readVal, env);
          env.ctx.moveTo(x + r * Math.cos(a1), y + r * Math.sin(a1));
          env.ctx.arc(x, y, r, a1, a2, d);
        },
      },
      {
        params: [arr, num, num, num, num],
        effect: (params, env) => {
          const [c, r, a1, a2, d] = params.map(env.readVal, env);
          env.ctx.moveTo(c[0] + r * Math.cos(a1), c[1] + r * Math.sin(a1));
          env.ctx.arc(c[0] + r, c[1], r, a1, a2, d);
        },
      },
    ],
    lineWidth: [
      {
        params: [num],
        effect: (params, env) => {
          env.ctx.lineWidth = env.readVal(params[0]);
        },
      },
    ],
    fillStyle: [
      {
        params: [{ type: types.COLOR }],
        effect: (params, env) => {
          env.ctx.fillStyle = hsla(env.readVal(params[0]));
        },
      },
    ],
    strokeStyle: [
      {
        params: [{ type: types.COLOR }],
        effect: (params, env) => {
          env.ctx.strokeStyle = hsla(env.readVal(params[0]));
        },
      },
    ],
    fill: [
      {
        params: [],
        effect: (_, env) => {
          env.ctx.fill();
        },
      },
    ],
    stroke: [
      {
        params: [],
        effect: (_, env) => {
          env.ctx.stroke();
        },
      },
    ],
  },
  vec: {
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
  },
  algo: {
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
  },
};
