import { types } from "../language";
import type { Module } from "../language";
import { hsla } from "../../utils";

const num = { type: types.NUMBER };
const arr = { type: types.ARRAY };

export const gfx: Module = {
  clear: {
    description: "Fills the whole canvas with white, or with the given color.",
    variants: [
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
  },
  beginPath: {
    description: "Starts a new, empty drawing path.",
    variants: [
      {
        params: [],
        effect: (_, env) => {
          env.ctx.beginPath();
        },
      },
    ],
  },
  moveTo: {
    description: "Moves the pen to a point without drawing a line.",
    variants: [
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
  },
  lineTo: {
    description: "Adds a straight line from the current point to the given point.",
    variants: [
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
  },
  curve2: {
    description:
      "Adds a quadratic Bézier curve using one control point and an end point.",
    variants: [
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
  },
  curve3: {
    description:
      "Adds a cubic Bézier curve using two control points and an end point.",
    variants: [
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
  },
  rect: {
    description:
      "Adds a rectangle to the path from a position and size, or from two corners.",
    variants: [
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
  },
  circle: {
    description: "Adds a circle to the path from a center and a radius.",
    variants: [
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
  },
  square: {
    description: "Adds a square to the path from a center and a side length.",
    variants: [
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
  },
  arc: {
    description:
      "Adds a circular arc to the path between two angles, in a given direction.",
    variants: [
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
  },
  lineWidth: {
    description: "Sets the width used when stroking lines.",
    variants: [
      {
        params: [num],
        effect: (params, env) => {
          env.ctx.lineWidth = env.readVal(params[0]);
        },
      },
    ],
  },
  fillStyle: {
    description: "Sets the color used to fill shapes.",
    variants: [
      {
        params: [{ type: types.COLOR }],
        effect: (params, env) => {
          env.ctx.fillStyle = hsla(env.readVal(params[0]));
        },
      },
    ],
  },
  strokeStyle: {
    description: "Sets the color used to stroke shapes.",
    variants: [
      {
        params: [{ type: types.COLOR }],
        effect: (params, env) => {
          env.ctx.strokeStyle = hsla(env.readVal(params[0]));
        },
      },
    ],
  },
  fill: {
    description: "Fills the current path with the fill color.",
    variants: [
      {
        params: [],
        effect: (_, env) => {
          env.ctx.fill();
        },
      },
    ],
  },
  stroke: {
    description: "Strokes the current path with the stroke color.",
    variants: [
      {
        params: [],
        effect: (_, env) => {
          env.ctx.stroke();
        },
      },
    ],
  },
};
