import { createStore, produce, SetStoreFunction, unwrap } from "solid-js/store";

import { updateDocument } from "./db";

import {
  types,
  instructionsDefinitions,
  Param,
  InstructionVariant,
} from "./language/language";

export type Type = number;

export type Instruction = {
  id: string;
  params: Param[];
  inputs: Param[];
  definition: [string, string];
};

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

export type ProgramContext = Instruction[];
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
  registers: Register[];
};

export type ProgramContextId = keyof Program["source"];

export type AppStore = {
  gui: {
    cursor: {
      programContextId: null | ProgramContextId;
      position: null | number;
    };
    selection: string[];
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
];
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
    registers: [...defaultRegisters],
  };
}

const [store, setStore] = createStore<AppStore>({
  gui: {
    cursor: {
      programContextId: null,
      position: null,
    },
    selection: [],
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
export function getSelectedLines() {
  const lines: Instruction[] = [];
  for (let contextName in store.program.source) {
    store.program.source[contextName as ProgramContextId].filter(
      (line: Instruction) => {
        return store.gui.selection.includes(line.id);
      },
    );
  }
  return lines;
}

export function getInput(
  sourcePath: ProgramContextId,
  lineId: string,
  index: number,
) {
  return store.program.source[sourcePath].find(
    (line: Instruction) => line.id === lineId,
  )?.code[index + 2];
}

//commands

export function resetRegisters() {
  setStore(
    produce((store) => {
      store.program.registers.forEach((r) => (r.value = r.initialValue));
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

export function insertAfter(sourcePath: ProgramContextId, id: string | null) {
  const newLineId = crypto.randomUUID();
  setStore(
    produce((store) => {
      const source = store.program.source[sourcePath] as ProgramContext;
      const i = id === null ? 0 : source.findIndex((line) => line.id === id);
      source.splice(i + (id === null ? 0 : 1), 0, {
        id: newLineId,
        params: [],
        code: ["", ""],
      });
    }),
  );
  setSelection([newLineId]);
  autoSave();
}

export function insertAtIndex(sourcePath: ProgramContextId, index: number) {
  setStore(
    produce((store) => {
      const source = store.program.source[sourcePath];
      const newLineId = crypto.randomUUID();
      source.splice(index + 1, 0, {
        id: newLineId,
        params: [],
        code: ["", ""],
      });
      store.gui.selection = [newLineId];
    }),
  );
  autoSave();
}

export function setCommand(module: string, command: string) {
  setStore(
    produce((store) => {
      let targetLine = null;
      for (let k in store.program.source) {
        targetLine = store.program.source[k as ProgramContextId].find(
          (line) => {
            return store.gui.selection.indexOf(line.id) !== -1;
          },
        );
        if (targetLine) {
          break;
        }
      }
      const instruction = instructionsDefinitions[module][command];
      const paramsCount = instruction.reduce(
        (t: number, inst: InstructionVariant) => {
          return Math.max(t, inst.params.length);
        },
        0,
      );
      const params = new Array(paramsCount).fill({ type: "empty", value: "" });
      targetLine?.code.push(module, command, ...params);
    }),
  );
  autoSave();
}

export function addParameter(sourcePath: ProgramContextId, lineId: string) {
  setStore(
    produce((store) => {
      const line = store.program.source[sourcePath].find(
        (l) => l.id === lineId,
      );
      line?.code.push({ type: "empty", value: "" });
    }),
  );
}

export function removeParameter(sourcePath: ProgramContextId, lineId: string) {
  setStore(
    produce((store) => {
      const line = store.program.source[sourcePath].find(
        (l) => l.id === lineId,
      );
      line?.code.pop();
    }),
  );
  autoSave();
}

export function setParameter(
  sourcePath: ProgramContextId,
  lineId: string,
  registerIndex: number,
  type: "empty" | "register" | "value",
  value: any,
) {
  setStore(
    produce((store) => {
      const line = store.program.source[sourcePath].find(
        (l) => l.id === lineId,
      );
      line!.code[registerIndex + 2] = { type: type, value: value };
    }),
  );
  autoSave();
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
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
      store.program.registers.push(register);
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
      const register = store.program.registers.find((r) => r.id === id);
      if (register) {
        register.type = type;
        register.color = color;
        register.name = name;
        (register.initialValue = value), (register.value = value);
      }
    }),
  );
  autoSave();
}

export function setSelection(ids: string[]) {
  setStore("gui", "selection", ids);
  if (ids.length === 1) {
    let cursor = undefined;
    const source = store.program.source;
    for (let context in source) {
      const candidate = source[context as ProgramContextId].findIndex(
        (l) => l.id === ids[0],
      );
      if (candidate !== -1) {
        cursor = {
          context: context,
          position: candidate,
        };
        break;
      }
    }
    if (cursor !== undefined) {
      setStore("gui", "cursor", cursor);
    }
  } else {
    clearCursor();
  }
}

export function clearCursor() {
  setStore("gui", "cursor", "context", null);
}

//click the title of a code section
export function clickContext(context: ProgramContextId) {
  setStore("gui", "selection", []);
  if (
    store.gui.cursor.programContextId === context &&
    store.gui.cursor.position === -1
  ) {
    setStore("gui", "cursor", { programContextId: context, position: null });
  } else {
    setStore("gui", "cursor", { programContextId: context, position: -1 });
  }
}

export function setCursor(context: ProgramContextId, position: number) {
  setStore("gui", "cursor", { programContextId: context, position });
}

export function addToSelection(id: string) {
  setStore(
    produce((store) => {
      store.gui.selection.push(id);
    }),
  );
}

export function deleteSelection() {
  setStore(
    produce((store) => {
      const source = store.program.source;
      store.gui.selection.forEach((idToDelete) => {
        for (let key in source) {
          const sourceEntry = source[key as ProgramContextId];
          for (let i = sourceEntry.length - 1; i >= 0; i--) {
            const line = sourceEntry[i];
            if (line.id === idToDelete) {
              sourceEntry.splice(i, 1);
            }
          }
        }
      });
    }),
  );
  setSelection([]);
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
