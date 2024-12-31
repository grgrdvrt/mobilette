import { Accessor, createSignal, Setter, untrack } from "solid-js";
import { Param, types, instructionsDefinitions } from "./language";
import { Instruction, Program, Register, Source } from "../store";

type IfDefinition = {
  type: "if";
  line: number;
  jumps: number | number[] | undefined;
};
type ForDefinition = {
  type: "for";
  targetRegister: Param;
  begin: number;
  end: number;
  step: number;
  beginLine: number;
  endLine: number;
};

export class Interpreter {
  onExecuted: (registers: Register[]) => void;
  stdOut: Accessor<Array<any>>;
  setStdOut: Setter<Array<any>>;
  mainCanvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  instructionId: number = 0;

  registers: Register[] = [];
  source: Record<string, Source> = {};
  jumpTable: Map<number, number | number[]> = new Map();
  initialTime: number = 0;

  rafHandle: number = 0;
  pointerX: number = 0;
  pointerY: number = 0;

  constructor(onExecuted: (registers: Register[]) => void) {
    this.onExecuted = onExecuted;

    const [stdOut, setStdOut] = createSignal<Array<any>>([]);
    this.stdOut = stdOut;
    this.setStdOut = setStdOut;

    this.mainCanvas = document.createElement("canvas");
    this.mainCanvas.style.width = "100%";
    this.mainCanvas.style.height = "100%";
    this.mainCanvas.style.touchAction = "none";
    this.ctx = this.mainCanvas.getContext("2d")!;
  }

  initProgram(program: Program) {
    this.registers = program.registers;
    this.source = program.source;
  }

  getReg(regId: Register["id"]) {
    const register = this.registers.find((r) => r.id === regId);
    if (!register) {
      throw new Error(`Register not found: ${regId}`);
    }
    return register;
  }

  setVal(regId: Register["id"], val: any) {
    this.getReg(regId).value = val;
  }

  readVal(param: Param) {
    switch (param.type) {
      case "value":
        return JSON.parse(JSON.stringify(param.value.value));
      case "register":
        return this.getReg(param.value).value;
      default:
        throw new Error(`unknown type ${param.type}`);
    }
  }

  readType(param: Param) {
    switch (param.type) {
      case "value":
        return param.value.type;
      case "register":
        return this.getReg(param.value).type;
      default:
        throw new Error(`unknown type ${param.type}`);
    }
  }

  readParam(param: Param) {
    switch (param.type) {
      case "value":
        return param.value;
      case "register":
        return this.getReg(param.value);
      default:
        throw new Error(`unknown type ${param.type}`);
    }
  }

  initJumpTable(instructions: Source) {
    this.jumpTable = new Map();
    const ifStack: number[][] = [];
    const forStack: number[] = [];
    instructions.forEach((line, i) => {
      if (line.code.length === 0) return;
      const [module, cmd] = line.code;
      if (module === "ctrl") {
        switch (cmd) {
          case "if":
            ifStack.push([i]);
            break;
          case "elseif": {
            ifStack[ifStack.length - 1].push(i);
            break;
          }
          case "else": {
            ifStack[ifStack.length - 1].push(i);
            break;
          }
          case "endif":
            const jumps = ifStack.pop();
            if (!jumps) {
              throw new Error(`No corresponding  \`if\` l.${i}`);
            }
            jumps.push(i);
            this.jumpTable.set(jumps[0], jumps);
            break;
          case "for":
            forStack.push(i);
            break;
          case "endfor":
            const jump = forStack.pop();
            if (!jump) {
              throw new Error(`No corresponding \`for\` l.${i}`);
            }
            this.jumpTable.set(jump, i);
            break;
        }
      }
    });
  }

  executeInstructions(instructions: Instruction[]) {
    this.initJumpTable(instructions);
    this.setVal("time", Date.now() - this.initialTime);
    this.instructionId = 0;
    const ctrlStack: (ForDefinition | IfDefinition)[] = [];
    while (this.instructionId < instructions.length) {
      const line = instructions[this.instructionId];
      // console.log(this.instructionId, JSON.stringify(line.code));
      // try{
      if (line.code.length) {
        const [module, cmd, ...params] = line.code;
        // const hasNull = params.some(p => p.value === "null");
        const hasNull = false;
        if (!hasNull) {
          if (module === "ctrl") {
            if (cmd === "if") {
              ctrlStack.push({
                type: "if",
                line: this.instructionId,
                jumps: this.jumpTable.get(this.instructionId),
              });
              if (this.readVal(params[0])) {
                this.instructionId++;
              } else {
                const jumps = this.jumpTable.get(this.instructionId);
                if (!jumps || !Array.isArray(jumps)) {
                  throw new Error(`\`if\` not closed l.${this.instructionId}`);
                }
                this.instructionId = jumps[1];
              }
            }
            if (cmd === "endif") {
              ctrlStack.pop();
              this.instructionId++;
            }
            if (cmd === "for") {
              let forDefinition: ForDefinition | undefined = ctrlStack.find(
                (c): c is ForDefinition =>
                  c.type === "for" && c.beginLine == this.instructionId,
              );
              if (!forDefinition) {
                const begin = this.readVal(params[1]);
                const end = this.readVal(params[2]);
                const step = begin < end ? 1 : -1;
                forDefinition = {
                  type: "for",
                  targetRegister: params[0],
                  begin,
                  end,
                  step,
                  beginLine: this.instructionId,
                  endLine: this.jumpTable.get(this.instructionId)! as number,
                };
                ctrlStack.push(forDefinition);
                this.setVal(forDefinition.targetRegister.value, begin);
              } else {
                this.setVal(
                  forDefinition.targetRegister.value,
                  this.readVal(forDefinition.targetRegister) +
                    forDefinition.step,
                );
              }

              if (
                this.readVal(forDefinition.targetRegister) !== forDefinition.end
              ) {
                this.instructionId++;
              } else {
                this.instructionId = forDefinition.endLine + 1;
                ctrlStack.pop();
              }
            }
            if (cmd === "break") {
              //find most recently encountered for. Some "If" can be opened
              let ctrlId = undefined;
              for (let i = ctrlStack.length - 1; i >= 0; i--) {
                const ctrl = ctrlStack[i];
                if (ctrl.type === "for") {
                  ctrlId = i;
                  break;
                }
              }
              if (ctrlId !== undefined) {
                const forDefinition = ctrlStack[ctrlId] as ForDefinition;
                //drop opened ifs and current for
                ctrlStack.length = ctrlId;
                this.instructionId = forDefinition.endLine + 1;
              }
            }
            if (cmd === "continue") {
              //find most recently encountered `for`. Some `if`s can be opened
              let ctrlId = undefined;
              for (let i = ctrlStack.length - 1; i >= 0; i--) {
                const ctrl = ctrlStack[i];
                if (ctrl.type === "for") {
                  ctrlId = i;
                  break;
                }
              }
              if (ctrlId !== undefined) {
                const forDefinition = ctrlStack[ctrlId] as ForDefinition;
                //drop opened ifs
                ctrlStack.length = ctrlId + 1;
                this.instructionId = forDefinition.beginLine;
              }
            }
            if (cmd === "endfor") {
              const forDefinition = ctrlStack[
                ctrlStack.length - 1
              ] as ForDefinition;
              const line = forDefinition.beginLine;
              this.instructionId = line;
            }
          } else {
            const filteredParams = params.filter((p) => p.type !== "empty");
            const instruction = instructionsDefinitions[module][cmd].find(
              (v) => {
                return (
                  (v.params[v.params.length - 1]?.variadic ||
                    v.params.length === filteredParams.length) &&
                  v.params.every(
                    (p, i) =>
                      p.type === types.ANY ||
                      p.type == this.readType(filteredParams[i]),
                  )
                );
              },
            );
            if (!instruction) {
              this.log(
                `${this.instructionId}: ERROR: can't find matching implementation : ${JSON.stringify(line.code)}; ${params.map((p) => this.readType(p))}`,
              );
              throw new Error();
            }
            instruction.effect(params, this);
            this.instructionId++;
          }
        } else {
          this.log(
            `${this.instructionId}: ERROR: has null param : ${JSON.stringify(line.code)}`,
          );
          this.instructionId++;
        }
      } else {
        //blank line
        this.instructionId++;
      }
      // }
      // catch(e){
      //     this.log(`${this.instructionId}: ERROR:${JSON.stringify(line.code)}`);
      //     this.instructionId++;
      // }
    }
    this.onExecuted(this.registers);
  }

  log(msg: string) {
    untrack(() => {
      this.setStdOut([...this.stdOut(), msg]);
    });
  }

  checkMainCanvasSize() {
    const w = this.mainCanvas.clientWidth;
    const h = this.mainCanvas.clientHeight;

    if (this.mainCanvas.width !== w || this.mainCanvas.height !== h) {
      this.mainCanvas.width = w;
      this.mainCanvas.height = h;
    }

    this.setVal("width", w);
    this.setVal("height", h);
    this.setVal("cx", w / 2);
    this.setVal("cy", h / 2);
    this.setVal("vs", [w, h]);
    this.setVal("vc", [w / 2, h / 2]);
  }

  play() {
    this.init();
    this.loop();
    this.mainCanvas.addEventListener("pointerdown", this.onPointerDown);
    this.mainCanvas.addEventListener("pointerup", this.onPointerUp);
    this.mainCanvas.addEventListener("pointermove", this.onPointerMove);
  }

  pause() {
    cancelAnimationFrame(this.rafHandle);
    this.mainCanvas.removeEventListener("pointerdown", this.onPointerDown);
    this.mainCanvas.removeEventListener("pointerup", this.onPointerUp);
    this.mainCanvas.removeEventListener("pointermove", this.onPointerMove);
  }

  init() {
    this.initialTime = Date.now();
    this.checkMainCanvasSize();
    const { width, height } = this.mainCanvas;
    this.ctx.clearRect(0, 0, width, height);
    this.updatePointer(0, 0);
    this.setStdOut([]);
    this.executeInstructions(this.source.init);
  }

  loop() {
    cancelAnimationFrame(this.rafHandle);
    this.rafHandle = requestAnimationFrame(() => this.loop());
    this.executeInstructions(this.source.loop);
  }

  updatePointer(pointerX: number, pointerY: number) {
    const rect = this.mainCanvas.getBoundingClientRect();
    const x = pointerX - rect.left;
    const y = pointerY - rect.top;
    this.setVal("pointerX", x);
    this.setVal("pointerY", y);
    this.setVal("pPointerX", this.pointerX);
    this.setVal("pPointerY", this.pointerY);

    this.setVal("pointer", [x, y]);
    this.setVal("pPointer", [this.pointerX, this.pointerY]);
    this.pointerX = x;
    this.pointerY = y;
  }

  onPointerDown = (e: PointerEvent) => {
    this.updatePointer(e.clientX, e.clientY);
    this.executeInstructions(this.source.pointerDown);
  };

  onPointerUp = (e: PointerEvent) => {
    this.updatePointer(e.clientX, e.clientY);
    this.executeInstructions(this.source.pointerUp);
  };

  onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    this.updatePointer(e.clientX, e.clientY);
    this.executeInstructions(this.source.pointerMove);
  };
}
