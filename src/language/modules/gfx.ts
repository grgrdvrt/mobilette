import { types } from "../language";
import type { Module } from "../language";
import { hsla } from "../../utils";

const num = { type: types.NUMBER };
const arr = { type: types.ARRAY };

export const gfx: Module = {
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
        env.ctx.arc(c[0], c[1], r, a1, a2, d);
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
};
