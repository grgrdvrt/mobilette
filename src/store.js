import { createStore, produce, unwrap } from "solid-js/store";

import { updateDocument } from "./db";

import { types, instructionsDefinitions } from "./language";

function makeRegister(name, type, value, x, y, color) {
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

export function createEmptyProgram() {
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

const [store, setStore] = createStore({
  gui: {
    cursor: {
      context: null,
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

export function useStore() {
  return [store, setStore];
}

Object.defineProperty(window, "store", {
  get: function () {
    return unwrap(store);
  },
});

//accessors
export function getSelectedLines() {
  const lines = [];
  for (let k in store.program.source) {
    store.program.source[k].forEach((line) => {
      if (store.gui.selection.includes(line.id)) {
        lines.push(line);
      }
    });
  }
  return lines;
}

export function getInput(sourcePath, lineId, index) {
  return store.program.source[sourcePath].find((line) => line.id === lineId)
    .code[index + 2];
}

//commands

export function resetRegisters() {
  setStore(
    produce((store) => {
      store.program.registers.forEach((r) => (r.value = r.initialValue));
    }),
  );
}

export function setProgram(program) {
  setStore(
    produce((store) => {
      store.program = program;
    }),
  );
}

export function insertAfter(sourcePath, id) {
  const newLineId = crypto.randomUUID();
  setStore(
    produce((store) => {
      const source = store.program.source[sourcePath];
      const i = id === null ? 0 : source.findIndex((line) => line.id === id);
      source.splice(i + (id === null ? 0 : 1), 0, { id: newLineId, code: [] });
    }),
  );
  setSelection([newLineId]);
  autoSave();
}

export function insertAtIndex(sourcePath, index) {
  setStore(
    produce((store) => {
      const source = store.program.source[sourcePath];
      const newLineId = crypto.randomUUID();
      source.splice(index + 1, 0, { id: newLineId, code: [] });
      store.gui.selection = [newLineId];
    }),
  );
  autoSave();
}

export function setCommand(module, command) {
  setStore(
    produce((store) => {
      let targetLine = null;
      for (let k in store.program.source) {
        targetLine = store.program.source[k].find((line) => {
          return store.gui.selection.indexOf(line.id) !== -1;
        });
        if (targetLine) {
          break;
        }
      }
      const instruction = instructionsDefinitions[module][command];
      const paramsCount = instruction.reduce((t, inst) => {
        return Math.max(t, inst.params.length);
      }, 0);
      const params = new Array(paramsCount).fill({ type: "empty", value: "" });
      targetLine.code.push(module, command, ...params);
    }),
  );
  autoSave();
}

export function addParameter(sourcePath, lineId) {
  setStore(
    produce((store) => {
      const line = store.program.source[sourcePath].find(
        (l) => l.id === lineId,
      );
      line.code.push({ type: "empty", value: "" });
    }),
  );
}

export function removeParameter(sourcePath, lineId) {
  setStore(
    produce((store) => {
      const line = store.program.source[sourcePath].find(
        (l) => l.id === lineId,
      );
      line.code.pop();
    }),
  );
  autoSave();
}

export function setParameter(sourcePath, lineId, registerIndex, type, value) {
  setStore(
    produce((store) => {
      const line = store.program.source[sourcePath].find(
        (l) => l.id === lineId,
      );
      line.code[registerIndex + 2] = { type: type, value: value };
    }),
  );
  autoSave();
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function randomRegisterColor() {
  return (
    "#" +
    ["ff", "80", Math.round(lerp(128, 256, Math.random())).toString("16")]
      .sort(() => Math.random() - 0.5)
      .join("")
  );
}

export function makeEmptyRegister(x, y) {
  return {
    id: "empty",
    type: types.ANY,
    name: "",
    initialValue: 0,
    value: 0,
    x: x,
    y: y,
    color: randomRegisterColor(),
  };
}

export function getRegisterByPosition(x, y) {
  return Object.values(store.program.registers).find(
    (r) => r.x === x && r.y === y,
  );
}
export function createRegister(x, y, type, color, name, value) {
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

export function saveRegister(id, type, color, name, value) {
  setStore(
    produce((store) => {
      const register = store.program.registers.find((r) => r.id === id);
      register.type = type;
      register.color = color;
      register.name = name;
      (register.initialValue = value), (register.value = value);
    }),
  );
  autoSave();
}

export function setSelection(ids) {
  setStore("gui", "selection", ids);
  if (ids.length === 1) {
    let cursor = undefined;
    const source = store.program.source;
    for (let context in source) {
      const candidate = source[context].findIndex((l) => l.id === ids[0]);
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
export function clickContext(context) {
  setStore("gui", "selection", []);
  if (
    store.gui.cursor.context === context &&
    store.gui.cursor.position === -1
  ) {
    setStore("gui", "cursor", { context, position: null });
  } else {
    setStore("gui", "cursor", { context, position: -1 });
  }
}

export function setCursor(context, position) {
  setStore("gui", "cursor", { context, position });
}

export function addToSelection(id) {
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
          for (let i = source[key].length - 1; i >= 0; i--) {
            const line = source[key][i];
            if (line.id === idToDelete) {
              source[key].splice(i, 1);
            }
          }
        }
      });
    }),
  );
  setSelection([]);
  autoSave();
}

export function setThumb(canvas) {
  setStore("program", "thumb", canvas.toDataURL("image/jpg"));
  save();
}

function save() {
  setStore("program", "lastOpened", Date.now());
  updateDocument(unwrap(store.program));
}

let savedRecently;
let requestSave;
let saveTimeout;
function autoSave() {
  if (savedRecently) {
    requestSave = true;
    return;
  } else {
    save();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveTimeout = null;
      if (requestSave) {
        save();
      }
      requestSave = false;
    }, 5000);
  }
}

const example = {
  id: "1ed0d2cf-b777-4e4c-ae22-e21e930c1c64",
  lastOpened: 1700532816496,
  source: {
    init: [
      {
        id: "26c8d45c-bcdc-4be9-8d6d-9872f395022d",
        code: [
          "ctrl",
          "for",
          "r:9eaeeb0c-88d0-4792-830b-617327598685",
          "r:0",
          "r:width",
        ],
      },
      {
        id: "cb44f315-36d6-4b6f-93fc-4460ec84464e",
        code: [
          "ctrl",
          "for",
          "r:43a46d97-3beb-4b3f-b62f-e539b35f1330",
          "r:0",
          "r:height",
        ],
      },
      {
        id: "516c8491-064d-4b12-a9b9-90e83f01731e",
        code: ["gfx", "beginPath"],
      },
      {
        id: "a1ac04ed-ecc1-44eb-b689-77759c6faae8",
        code: [
          "gfx",
          "rect",
          "r:9eaeeb0c-88d0-4792-830b-617327598685",
          "r:43a46d97-3beb-4b3f-b62f-e539b35f1330",
          "r:1",
          "r:1",
        ],
      },
      {
        id: "959f480b-d4f3-48c8-9d44-6035eefe30be",
        code: [
          "algo",
          "noise2D",
          "r:9eaeeb0c-88d0-4792-830b-617327598685",
          "r:43a46d97-3beb-4b3f-b62f-e539b35f1330",
          "r:15c7882b-0451-4dea-85ad-a8bbb6f55f96",
        ],
      },
      {
        id: "0402cf02-5d4d-4cb0-83ab-d6451c99b143",
        code: [
          "maths",
          "*",
          "r:15c7882b-0451-4dea-85ad-a8bbb6f55f96",
          "v:100",
          "r:15c7882b-0451-4dea-85ad-a8bbb6f55f96",
        ],
      },
      {
        id: "ff569288-73f9-4581-a046-0bf66afdb8e7",
        code: [
          "maths",
          "round",
          "r:15c7882b-0451-4dea-85ad-a8bbb6f55f96",
          "r:15c7882b-0451-4dea-85ad-a8bbb6f55f96",
        ],
      },
      {
        id: "a58854b2-db95-45e7-b057-e7b5d00ada12",
        code: [
          "array",
          "struct",
          "r:f7ec6c8d-f5ca-4cc0-9b5e-cca2450aa0b9",
          "r:0",
          "r:0",
          "r:15c7882b-0451-4dea-85ad-a8bbb6f55f96",
        ],
      },
      {
        id: "94690e1e-63b9-459e-b1e1-dd8a0beaa8a3",
        code: ["gfx", "fillStyle", "r:f7ec6c8d-f5ca-4cc0-9b5e-cca2450aa0b9"],
      },
      { id: "c72f6ce2-f521-4d02-8f35-b67935e0529f", code: ["gfx", "fill"] },
      { id: "20dc7387-4283-4f70-bf3c-630251ee80d4", code: ["ctrl", "endfor"] },
      { id: "ec18c808-7b77-4c28-9a20-ff35ec80a049", code: ["ctrl", "endfor"] },
    ],
    loop: [],
    pointerDown: [],
    pointerUp: [],
    pointerMove: [],
  },
  registers: [
    {
      id: "null",
      name: "null",
      type: 1,
      initialValue: null,
      value: null,
      x: -1,
      y: -1,
      color: "#95ff80",
    },
    {
      id: "width",
      name: "width",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 10,
      y: 6,
      color: "#9180ff",
    },
    {
      id: "height",
      name: "height",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 11,
      y: 6,
      color: "#80b3ff",
    },
    {
      id: "cx",
      name: "cx",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 10,
      y: 7,
      color: "#80ffe0",
    },
    {
      id: "cy",
      name: "cy",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 11,
      y: 7,
      color: "#80ff95",
    },
    {
      id: "pointerX",
      name: "pointerX",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 13,
      y: 6,
      color: "#ff80da",
    },
    {
      id: "pointerY",
      name: "pointerY",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 14,
      y: 6,
      color: "#80ffed",
    },
    {
      id: "pPointerX",
      name: "pPointerX",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 13,
      y: 7,
      color: "#8280ff",
    },
    {
      id: "pPointerY",
      name: "pPointerY",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 14,
      y: 7,
      color: "#ff80d7",
    },
    {
      id: "time",
      name: "time",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 16,
      y: 6,
      color: "#9b80ff",
    },
    {
      id: "π",
      name: "π",
      type: 1,
      initialValue: 3.141592653589793,
      value: 3.141592653589793,
      x: 18,
      y: 6,
      color: "#ff80c2",
    },
    {
      id: "2π",
      name: "2π",
      type: 1,
      initialValue: 6.283185307179586,
      value: 6.283185307179586,
      x: 19,
      y: 6,
      color: "#af80ff",
    },
    {
      id: "√2",
      name: "√2",
      type: 1,
      initialValue: 1.4142135623730951,
      value: 1.4142135623730951,
      x: 18,
      y: 7,
      color: "#ff80c8",
    },
    {
      id: "√2/2",
      name: "√2/2",
      type: 1,
      initialValue: 0.7071067811865476,
      value: 0.7071067811865476,
      x: 19,
      y: 7,
      color: "#80ffe1",
    },
    {
      id: "-1",
      name: "-1",
      type: 1,
      initialValue: -1,
      value: -1,
      x: 18,
      y: 8,
      color: "#fdff80",
    },
    {
      id: "1",
      name: "1",
      type: 1,
      initialValue: 1,
      value: 1,
      x: 19,
      y: 8,
      color: "#ffd280",
    },
    {
      id: "0",
      name: "0",
      type: 1,
      initialValue: 0,
      value: 0,
      x: 18,
      y: 9,
      color: "#ef80ff",
    },
    {
      id: "2",
      name: "2",
      type: 1,
      initialValue: 2,
      value: 2,
      x: 19,
      y: 9,
      color: "#ae80ff",
    },
    {
      id: "fb523b45-bf8f-4a16-9c59-1f27398c2c95",
      type: 1,
      name: "",
      initialValue: 0,
      value: 0,
      color: "#db80ff",
      x: 11,
      y: 9,
    },
    {
      id: "9eaeeb0c-88d0-4792-830b-617327598685",
      type: 1,
      name: "i",
      initialValue: 0,
      value: 0,
      color: "#ddff80",
      x: 10,
      y: 9,
    },
    {
      id: "43a46d97-3beb-4b3f-b62f-e539b35f1330",
      type: 1,
      name: "j",
      initialValue: 0,
      value: 0,
      color: "#e280ff",
      x: 10,
      y: 10,
    },
    {
      id: "f7ec6c8d-f5ca-4cc0-9b5e-cca2450aa0b9",
      type: 1,
      name: "color",
      initialValue: 0,
      value: 0,
      color: "#ffcf80",
      x: 11,
      y: 10,
    },
    {
      id: "15c7882b-0451-4dea-85ad-a8bbb6f55f96",
      type: 1,
      name: "k",
      initialValue: 0,
      value: 0,
      color: "#ff80cf",
      x: 12,
      y: 9,
    },
    {
      id: "0678a9c3-f5f2-4e45-9d81-022a90a12210",
      type: 1,
      name: "val",
      initialValue: 0,
      value: 0,
      color: "#ff80b3",
      x: 12,
      y: 10,
    },
  ],
};
