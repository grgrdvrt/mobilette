import { createStore, produce, SetStoreFunction, unwrap } from "solid-js/store";

import { updateDocument } from "./db";

import {
  types,
  instructionsDefinitions,
  ParamInput,
  InstructionVariant,
} from "./language/language";
import { lerp } from "./utils";

export type Type = number;

export type ParamSlot = ParamInput | undefined;
export type Instruction = [string, string, ...ParamSlot[]];
export type InstructionPath = {
  programContextId: ProgramContextId;
  lineIndex: number;
};
export type SlotPath = InstructionPath & { slotIndex: number };

export type Register = {
  id: string;
  type: Type;
  name: string;
  initialValue: any;
  value: any;
  x: number;
  y: number;
  color: string;
};
export type Registers = Record<string, Register>;

export type ProgramContext = (Instruction | undefined)[];
export type Program = {
  id: string;
  lastOpened: number;
  thumb: string;
  source: {
    init: ProgramContext;
    loop: ProgramContext;
    pointerDown: ProgramContext;
    pointerUp: ProgramContext;
    pointerMove: ProgramContext;
  };
  registers: Registers;
};

export type ProgramContextId = keyof Program["source"];

export type AppStore = {
  gui: {
    cursor: InstructionPath | null;
    registers: {
      scrollTop: number;
      scrollLeft: number;
    };
  };
  program: Program;
};

function makeRegister(
  name: string,
  type: number,
  value: any,
  x: number,
  y: number,
  color?: string,
): Register {
  return {
    id: name,
    name,
    type,
    initialValue: value,
    value,
    x,
    y,
    color: color ?? randomRegisterColor(),
  };
}

const defaultRegisters = [
  makeRegister("null", types.ANY, null, -1, -1),

  makeRegister("width", types.NUMBER, 0, 0, 10),
  makeRegister("height", types.NUMBER, 0, 1, 10),
  makeRegister("cx", types.NUMBER, 0, 0, 11),
  makeRegister("cy", types.NUMBER, 0, 1, 11),
  makeRegister("vs", types.ARRAY, [0, 0], 0, 9),
  makeRegister("vc", types.ARRAY, [0, 0], 1, 9),

  makeRegister("pointerX", types.NUMBER, 0, 3, 10),
  makeRegister("pointerY", types.NUMBER, 0, 4, 10),
  makeRegister("pPointerX", types.NUMBER, 0, 3, 11),
  makeRegister("pPointerY", types.NUMBER, 0, 4, 11),
  makeRegister("pointer", types.ARRAY, [0, 0], 3, 9),
  makeRegister("pPointer", types.ARRAY, [0, 0], 4, 9),

  makeRegister("time", types.NUMBER, 0, 6, 10),
  makeRegister("00", types.ARRAY, [0, 0], 6, 9),
  makeRegister("10", types.ARRAY, [1, 0], 7, 9),
  makeRegister("01", types.ARRAY, [0, 1], 8, 9),

  makeRegister("π", types.NUMBER, Math.PI, 8, 10),
  makeRegister("2π", types.NUMBER, 2 * Math.PI, 9, 10),
  makeRegister("√2", types.NUMBER, Math.SQRT2, 8, 11),
  makeRegister("√2/2", types.NUMBER, Math.SQRT1_2, 9, 11),

  makeRegister("-1", types.NUMBER, -1, 8, 12),
  makeRegister("1", types.NUMBER, 1, 9, 12),
  makeRegister("0", types.NUMBER, 0, 8, 13),
  makeRegister("2", types.NUMBER, 2, 9, 13),
  makeRegister("100", types.NUMBER, 100, 8, 14),
  makeRegister("360", types.NUMBER, 360, 9, 14),
].reduce((acc, reg) => {
  acc[reg.id] = reg;
  return acc;
}, {} as Registers);
export function createEmptyProgram(): Program {
  return {
    id: crypto.randomUUID(),
    lastOpened: Date.now(),
    thumb: "",
    source: {
      init: [],
      loop: [],
      pointerDown: [],
      pointerUp: [],
      pointerMove: [],
    },
    registers: JSON.parse(JSON.stringify(defaultRegisters)),
  };
}

const [store, setStore] = createStore<AppStore>({
  gui: {
    cursor: null,
    registers: {
      scrollTop: 224,
      scrollLeft: 376,
    },
  },
  program: createEmptyProgram(),
});

export function useStore(): [AppStore, SetStoreFunction<AppStore>] {
  return [store, setStore];
}

Object.defineProperty(window, "store", {
  get: function () {
    return unwrap(store);
  },
});

//accessors

export function getInstruction({
  programContextId: context,
  lineIndex: index,
}: InstructionPath) {
  return store.program.source[context][index];
}

export function getSlot(
  { programContextId: context, lineIndex: index }: InstructionPath,
  slotIndex: number,
) {
  const instruction = store.program.source[context][index];
  if (instruction) {
    return instruction[slotIndex + 2] as ParamSlot;
  } else {
    return undefined;
  }
}

export function hasSelection() {
  return store.gui.cursor !== null;
}

//commands

export function resetRegisters() {
  setStore(
    produce((store) => {
      for (let register of Object.values(store.program.registers)) {
        register.value = register.initialValue;
      }
    }),
  );
}

export function setProgram(program: Program) {
  setStore(
    produce((store) => {
      store.program = program;
    }),
  );
}

export function insertAfter(sourcePath: ProgramContextId, lineIndex: number) {
  setStore(
    produce((store) => {
      const source = store.program.source[sourcePath] as ProgramContext;
      source.splice(lineIndex + 1, 0, undefined);
    }),
  );
  setCursor(sourcePath, lineIndex + 1);
  autoSave();
}

export function setCommand(module: string, command: string) {
  setStore(
    produce((store) => {
      if (!store.gui.cursor) {
        return;
      }
      const instructionDefinition = instructionsDefinitions[module][command];
      const paramsCount = instructionDefinition.reduce(
        (t: number, inst: InstructionVariant) => {
          return Math.max(t, inst.params.length);
        },
        0,
      );
      const instruction: Instruction = [module, command];
      const params = new Array(paramsCount).fill(undefined);
      instruction.push(...params);
      const { programContextId: context, lineIndex: index } = store.gui.cursor;
      store.program.source[context][index] = instruction;
    }),
  );
  autoSave();
}

export function addSlot({
  programContextId: context,
  lineIndex: index,
}: InstructionPath) {
  setStore(
    produce((store) => {
      const line = store.program.source[context][index];
      line?.push(undefined);
    }),
  );
}

export function removeSlot({
  programContextId: context,
  lineIndex: index,
}: InstructionPath) {
  setStore(
    produce((store) => {
      const line = store.program.source[context][index];
      line?.pop();
    }),
  );
  autoSave();
}

export function setParameter(
  { programContextId, lineIndex, slotIndex }: SlotPath,
  type: "register" | "value",
  value: any,
) {
  setStore(
    produce((store) => {
      const line = store.program.source[programContextId][lineIndex];
      line![slotIndex + 2] = { type: type, content: value };
    }),
  );
  autoSave();
}

function randomRegisterColor() {
  return (
    "#" +
    ["ff", "80", Math.round(lerp(128, 256, Math.random())).toString(16)]
      .sort(() => Math.random() - 0.5)
      .join("")
  );
}

export function makeEmptyRegister(x: number, y: number): Register {
  return {
    id: "empty",
    type: types.NUMBER,
    name: "",
    initialValue: 0,
    value: 0,
    x: x,
    y: y,
    color: randomRegisterColor(),
  };
}

export function getRegisterByPosition(x: number, y: number) {
  return Object.values(store.program.registers).find(
    (r) => r.x === x && r.y === y,
  );
}
export function createRegister(
  x: number,
  y: number,
  type: number,
  color: string,
  name: string,
  value: any,
) {
  setStore(
    produce((store) => {
      const register = {
        id: crypto.randomUUID(),
        type,
        name,
        initialValue: value,
        value,
        color,
        x,
        y,
      };
      store.program.registers[register.id] = register;
    }),
  );
  autoSave();
}

export function saveRegister(
  id: string,
  type: number,
  color: string,
  name: string,
  value: any,
) {
  setStore(
    produce((store) => {
      const register = store.program.registers[id];
      if (register) {
        register.type = type;
        register.color = color;
        register.name = name;
        register.initialValue = value;
        register.value = value;
      }
    }),
  );
  autoSave();
}

export function getRegisterDefaultName(register: Register) {
  return `${String.fromCharCode(register.x + 65)}:${register.y}`;
}

export function clearCursor() {
  setStore("gui", "cursor", null);
}

//click the title of a code section
export function clickContext(context: ProgramContextId) {
  const cursor = store.gui.cursor;
  if (
    cursor &&
    cursor.programContextId === context &&
    cursor.lineIndex === -1
  ) {
    setStore("gui", "cursor", null);
  } else {
    setStore("gui", "cursor", { programContextId: context, lineIndex: -1 });
  }
}

export function setCursor(context: ProgramContextId, index: number) {
  setStore("gui", "cursor", { programContextId: context, lineIndex: index });
}

export function deleteLine({
  programContextId: context,
  lineIndex: index,
}: InstructionPath) {
  setStore(
    produce((store) => {
      const source = store.program.source;
      source[context].splice(index, 1);
    }),
  );
  clearCursor();
  autoSave();
}

export function setThumb(canvas: HTMLCanvasElement) {
  setStore("program", "thumb", canvas.toDataURL("image/jpg"));
  save();
}

function save() {
  setStore("program", "lastOpened", Date.now());
  updateDocument(unwrap(store.program));
}

let savedRecently: boolean = false;
let requestSave: boolean = false;
let saveTimeout: number | undefined = undefined;
function autoSave() {
  if (savedRecently) {
    requestSave = true;
    return;
  } else {
    save();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveTimeout = undefined;
      if (requestSave) {
        save();
      }
      requestSave = false;
    }, 5000);
  }
}
