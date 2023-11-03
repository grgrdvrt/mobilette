import {instructionsDefinitions} from "./language";

export class Interpreter{
    constructor(onExecuted){
        this.onExecuted = onExecuted;
        this.mainCanvas = document.createElement("canvas");
        this.mainCanvas.style.width = "100%";
        this.mainCanvas.style.height = "100%";
        this.ctx = this.mainCanvas.getContext("2d");
    }

    initProgram(source, registers){
        this.registers = registers;
        this.source = source;
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

    executeInstructions(instructions){
        this.setVal("r:time", Date.now());
        instructions.forEach(line => {
            const [module, cmd, ...params] = line;
            instructionsDefinitions[module][cmd](params, this);
        });
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
        this.pointerDownBind = (e) => this.onPointerDown(e);
        this.pointerUpBind = (e) => this.onPointerUp(e);
        this.pointerMoveBind = (e) => this.onPointerMove(e);
        this.mainCanvas.addEventListener("pointerdown", this.pointerDownBind);
        this.mainCanvas.addEventListener("pointerup", this.pointerUpBind);
        this.mainCanvas.addEventListener("pointermove", this.pointerMoveBind);
    }

    pause(){
        cancelAnimationFrame(this.raf);
        this.mainCanvas.removeEventListener("pointerdown", this.pointerDownBind);
        this.mainCanvas.removeEventListener("pointerup", this.pointerUpBind);
        this.mainCanvas.removeEventListener("pointermove", this.pointerMoveBind);
    }

    init(){
        this.checkMainCanvasSize();
        this.executeInstructions(this.source.init);
    }

    loop(){
        this.raf = requestAnimationFrame(() => this.loop());
        this.executeInstructions(this.source.loop);
    }

    onPointerDown(){
        this.executeInstructions(this.source.pointerDown);
    }

    onPointerUp(){
        this.executeInstructions(this.source.pointerUp);
    }

    onPointerMove(){
        this.executeInstructions(this.source.pointerMove);
    }
}
