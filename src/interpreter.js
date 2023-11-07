import {createSignal} from "solid-js";
import {instructionsDefinitions} from "./language";

export class Interpreter{
    constructor(onExecuted){
        this.onExecuted = onExecuted;

        const [stdOut, setStdOut] = createSignal([]);
        this.stdOut = stdOut;
        this.setStdOut = setStdOut;

        this.mainCanvas = document.createElement("canvas");
        this.mainCanvas.style.width = "100%";
        this.mainCanvas.style.height = "100%";
        this.ctx = this.mainCanvas.getContext("2d");
    }

    initProgram(program){
        this.registers = program.registers;
        this.source = program.source;
    }

    getReg(regId){
        return this.registers.find(r => r.id === regId);
    }

    setVal(regId, val){
        this.getReg(regId.substr(2)).value = val;
    }

    readVal(param){
        const [pfx, val] = [param.substr(0, 2), param.substr(2)];
        switch(pfx){
        case "v:":
            return eval(val);
        case "r:":
            return this.getReg(val).value;
        }
        return 0;
    }

    initJumpTable(instructions){
        this.jumpTable = new Map();
        const ifStack = [];
        const forStack = [];
        instructions.forEach((line, i) => {
            const [module, cmd, ...params] = line;
            if(module==="ctrl"){
                switch(cmd){
                case "if":
                    ifStack.push([i]);
                    break;
                case "elseif":{
                    ifStack[ifStack.length - 1].push(i);
                    this.jumpTable.set(i, ifStack[ifStack.length - 1]);
                    break;
                }
                case "else":{
                    ifStack[ifStack.length - 1].push(i);
                    break;
                }
                case "endif":
                    const jumps = ifStack.pop();
                    break;
                case "for":
                    forStack.push(i);
                    break;
                case "break":
                    this.jumpTable.set(i, forStack[forStack.length - 1]);
                    break;
                case "continue":
                    this.jumpTable.set(i, forStack[forStack.length - 1]);
                    break;
                case "endfor":
                    const forBegin = forStack.pop();
                    this.jumpTable.set(i, forBegin);
                    this.jumpTable.set(forBegin, i);
                    break;
                }
            }
        });
    }


    executeInstructions(instructions){
        // this.initJumpTableanstructions();
        this.setVal("r:time", Date.now());
        this.instructionId = 0;
        while(this.instructionId < instructions.length){
            const line = instructions[this.instructionId];
            let jumped = false;
            if(line.code.length){
                const [module, cmd, ...params] = line.code;
                if(!params.includes("r:null")){
                    jumped = instructionsDefinitions[module][cmd].effect(params, this);
                }
            }
            if(!jumped){
                this.instructionId++;
            }
        }
        this.onExecuted(this.registers);
    }

    checkMainCanvasSize(){
        const w = this.mainCanvas.clientWidth;
        const h = this.mainCanvas.clientHeight;

        if(this.mainCanvas.width !== w || this.mainCanvas.height !== h){
            this.mainCanvas.width = w;
            this.mainCanvas.height = h;
        }

        this.setVal("r:width", w);
        this.setVal("r:height", h);
    }

    play(){
        this.init();
        this.loop();
        this.mainCanvas.addEventListener("pointerdown", this.onPointerDown);
        this.mainCanvas.addEventListener("pointerup", this.onPointerUp);
        this.mainCanvas.addEventListener("pointermove", this.onPointerMove);
    }

    pause(){
        cancelAnimationFrame(this.raf);
        this.mainCanvas.removeEventListener("pointerdown", this.onPointerDown);
        this.mainCanvas.removeEventListener("pointerup", this.onPointerUp);
        this.mainCanvas.removeEventListener("pointermove", this.onPointerMove);
    }

    init(){
        this.checkMainCanvasSize();
        this.updatePointer(0, 0);
        this.setStdOut([]);
        this.executeInstructions(this.source.init);
    }

    loop(){
        this.raf = requestAnimationFrame(() => this.loop());
        this.executeInstructions(this.source.loop);
    }

    updatePointer(x, y){
        this.setVal("r:pointerX", x);
        this.setVal("r:pointerY", y);
        this.setVal("r:pPointerX", this.pointerX);
        this.setVal("r:pPointerY", this.pointerY);
        this.pointerX = x;
        this.pointerY = y;
    }

    onPointerDown = (e) => {
        this.updatePointer(e.clientX, e.clientY);
        this.executeInstructions(this.source.pointerDown);
    }

    onPointerUp = (e) => {
        this.updatePointer(e.clientX, e.clientY);
        this.executeInstructions(this.source.pointerUp);
    }

    onPointerMove = (e) => {
        this.updatePointer(e.clientX, e.clientY);
        this.executeInstructions(this.source.pointerMove);
    }
}
