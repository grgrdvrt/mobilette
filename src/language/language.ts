import { registers } from "./modules/registers";
import { ctrl } from "./modules/ctrl";
import { maths } from "./modules/maths";
import { bool } from "./modules/bool";
import { gfx } from "./modules/gfx";
import { vec } from "./modules/vec";
import { algo } from "./modules/algo";
import type { Module } from "./instructionHelpers";

export const instructionsDefinitions: Record<string, Module> = {
  registers,
  ctrl,
  maths,
  bool,
  gfx,
  vec,
  algo,
};

export * from "./instructionHelpers";
