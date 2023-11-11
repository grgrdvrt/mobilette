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
        this.mainCanvas.style.touchAction = "none";
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
            return Number(this.getReg(val).value);
        }
        return 0;
    }

    initJumpTable(instructions){
        this.jumpTable = new Map();
        const ifStack = [];
        const forStack = [];
        instructions.forEach((line, i) => {
            if(line.code.length === 0)return;
            const [module, cmd, ...params] = line.code;
            if(module==="ctrl"){
                switch(cmd){
                case "if":
                    ifStack.push([i]);
                    break;
                case "elseif":{
                    ifStack[ifStack.length - 1].push(i);
                    break;
                }
                case "else":{
                    ifStack[ifStack.length - 1].push(i);
                    break;
                }
                case "endif":
                    const jumps = ifStack.pop();
                    jumps.push(i);
                    this.jumpTable.set(jumps[0], jumps);
                    break;
                case "for":
                    forStack.push(i);
                    break;
                case "endfor":
                    this.jumpTable.set(forStack.pop(), i);
                    break;
                }
            }
        });
    }


    executeInstructions(instructions){
        this.initJumpTable(instructions);
        this.setVal("r:time", Date.now());
        this.instructionId = 0;
        const ctrlStack = [];
        while(this.instructionId < instructions.length){
            const line = instructions[this.instructionId];
            console.log(this.instructionId, line.code.join(" "));
            // debugger;
            try{
                if(line.code.length){
                    const [module, cmd, ...params] = line.code;
                    if(!params.includes("r:null")){
                        if(module === "ctrl"){
                            if(cmd === "if"){
                                ctrlStack.push({
                                    type:"if",
                                    line:this.instructionId,
                                    jumps:this.jumpTable.get(this.instructionId)
                                });
                                if(this.readVal(params[0])){
                                    this.instructionId++;
                                }
                                else{
                                    this.instructionId = this.jumpTable.get(this.instructionId)[1];
                                }
                            }
                            if(cmd === "endif"){
                                ctrlStack.pop();
                                this.instructionId++;
                            }
                            if(cmd === "for"){
                                let forDefinition = ctrlStack.find(c => c.beginLine== this.instructionId);
                                if(!forDefinition){
                                    const begin = this.readVal(params[1]);
                                    const end = this.readVal(params[2]);
                                    const step = begin < end ? 1 : -1;
                                    forDefinition = {
                                        type:"for",
                                        targetRegister:params[0],
                                        begin, end, step,
                                        beginLine:this.instructionId,
                                        endLine:this.jumpTable.get(this.instructionId)
                                    };
                                    ctrlStack.push(forDefinition);
                                    this.setVal(forDefinition.targetRegister, begin);
                                };
                                if(this.readVal(forDefinition.targetRegister) === forDefinition.end){
                                    this.instructionId = forDefinition.endLine + 1;
                                    ctrlStack.pop();
                                }
                                else{
                                    this.setVal(forDefinition.targetRegister, this.readVal(forDefinition.targetRegister) + forDefinition.step);
                                    this.instructionId++;
                                }
                            }
                            if(cmd === "break"){
                                //find most recently encountered for. Some "If" can be opened
                                let ctrlId = undefined;
                                debugger;
                                for(let i = ctrlStack.length - 1; i >= 0; i--){
                                    const ctrl = ctrlStack[i];
                                    if(ctrl.type === "for"){
                                        ctrlId = i;
                                        break;
                                    }
                                }
                                debugger;
                                if(ctrlId !== undefined){
                                    const forDefinition = ctrlStack[ctrlId];
                                    //drop opened ifs and current for
                                    ctrlStack.length = ctrlId;
                                    this.instructionId = forDefinition.endLine + 1;
                                }
                            }
                            if(cmd === "continue"){
                                //find most recently encountered for. Some "If" can be opened
                                let ctrlId = undefined;
                                for(let i = ctrlStack.length - 1; i >= 0; i--){
                                    const ctrl = ctrlStack[i];
                                    if(ctrl.type === "for"){
                                        ctrlId = i;
                                        break;
                                    }
                                }
                                if(ctrlId !== undefined){
                                    const forDefinition = ctrlStack[ctrlId];
                                    //drop opened ifs
                                    ctrlStack.length = ctrlId + 1;
                                    this.instructionId = forDefinition.beginLine;
                                }
                            }
                            if(cmd === "endfor"){
                                const forDefinition = ctrlStack[ctrlStack.length - 1];
                                const line = forDefinition.beginLine;
                                this.instructionId = line;
                            }
                        }
                        else{
                            instructionsDefinitions[module][cmd].effect(params, this);
                            this.instructionId++;
                        }
                    }
                }
                else{
                    //blank line
                    this.instructionId++;
                }
            }
            catch(e){
                throw(new Error(`line ${this.instructionId}:${line.code.join(" ")}`));
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
        const {width, height} = this.mainCanvas;
        this.ctx.clearRect(0, 0, width, height);
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
        e.preventDefault();
        this.updatePointer(e.clientX, e.clientY);
        this.executeInstructions(this.source.pointerMove);
    }
}
