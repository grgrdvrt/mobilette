import {
    createStore,
    produce,
    unwrap,
} from "solid-js/store";

import {types, instructionsDefinitions} from "./language";

function createEmptyProgram(){
    return {
        source:{
            init:[],
            loop:[],
            pointerDown:[],
            pointerUp:[],
            pointerMove:[],
        }
    };
}


const [store, setStore] = createStore({
    gui:{
        selection:[],
    },
    program:createEmptyProgram(),
});

export function useStore(){
    return [store, setStore];
};

Object.defineProperty(window, 'store', {
    get: function() {
        return unwrap(store);
    }
});

//accessors
export function getSelectedLines(){
    const lines = [];
    for(let k in store.program.source){
        store.program.source[k].forEach(line => {
            if(store.gui.selection.includes(line.id)){
                lines.push(line);
            }
        });
    }
    return lines;
}

export function getInput(sourcePath, lineId, index){
    return store.program.source[sourcePath].find(line => line.id === lineId).code[index + 2];
}

//commands

export function resetRegisters(){
    setStore(produce(store => {
        store.program.registers.forEach(r => r.value = r.initialValue);
    }));
}

export function setProgram(program){
    setStore(produce(store => {
        store.program = program;
    }));
}

export function insertAfter(sourcePath, id){
    setStore(produce(store => {
        const source = store.program.source[sourcePath];
        const i = source.findIndex(line => line.id === id);
        const newLineId = crypto.randomUUID();
        source.splice(i + 1, 0, {id:newLineId, code:[]});
        store.gui.selection = [newLineId];

    }));
}

export function setCommand(module, command){
    setStore(produce(store => {
        let targetLine = null;
        for(let k in store.program.source){
            targetLine = store.program.source[k].find(line => {
                return store.gui.selection.indexOf(line.id) !== -1;
            });
            if(targetLine){
                break;
            }
        }
        const paramsCount = instructionsDefinitions[module][command].params.length;
        const params = new Array(paramsCount).fill("r:null");
        targetLine.code.push(module, command, ...params);
    }));
}

export function addParameter(sourcePath, lineId){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code.push("r:null");
    }));
}

export function removeParameter(sourcePath, lineId){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code.pop();
    }));
}

export function setValue(sourcePath, lineId, registerIndex, value){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code[registerIndex + 2] = `v:${value}`;
    }));
}

export function setRegister(sourcePath, lineId, registerIndex, registerId){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code[registerIndex + 2] = `r:${registerId}`;
    }));
}

function lerp(a, b, t){
    return a + t * (b - a);
}

function randomRegisterColor(){
    return "#" + ["ff", "80", Math.round(lerp(128, 256, Math.random())).toString("16")].sort(() => Math.random() - 0.5).join("");
}

export function makeEmptyRegister(x, y){
    return {
        id:"empty",
        type:types.NUMBER,
        name:"",
        initialValue:0,
        value:0,
        x:x,
        y:y,
        color:randomRegisterColor(),
    };
}

export function getRegisterByPosition(x, y){
    return Object.values(store.program.registers).find(r => r.x === x && r.y === y);
}
export function createRegister(x, y, type, color, name, value){
    setStore(produce(store => {
        const register = {
            id: crypto.randomUUID(),
            type,
            name,
            value,
            color,
            x,
            y,
        };
        store.program.registers.push(register);
    }));
}

export function saveRegister(id, type, color, name, value){
    setStore(produce(store => {
        const register = store.program.registers.find(r => r.id === id);
        register.type = type;
        register.color = color;
        register.name = name;
        register.value = value;
    }));

}

export function setSelection(ids){
    setStore("gui", "selection", ids);
}

export function addToSelection(id){
    setStore(produce(store => {
        store.gui.selection.push(id);
    }));
}

export function deleteSelection(){
    setStore(produce(store => {
        const source = store.program.source;
        store.gui.selection.forEach(idToDelete => {
            for(let key in source){
                for(let i = source[key].length - 1; i >= 0; i--){
                    const line = source[key][i];
                    if(line.id === idToDelete) {
                        source[key].splice(i, 1);
                    }
                }
            }
        });
        store.gui.selection.length = 0;
    }));
}

function makeRegister(name, value, x, y, color){
    return {
        id:name,
        name,
        type:types.NUMBER,
        initialValue:value,
        value,
        x,
        y,
        color:color??randomRegisterColor()
    };
}

const defaultRegisters = [
    makeRegister("null", null, -1, -1),

    makeRegister("width", 0, 0, 0),
    makeRegister("height", 0, 1, 0),
    makeRegister("cx", 0, 0, 1),
    makeRegister("cy", 0, 1, 1),

    makeRegister("pointerX", 0, 3, 0),
    makeRegister("pointerY", 0, 4, 0),
    makeRegister("pPointerX", 0, 3, 1),
    makeRegister("pPointerY", 0, 4, 1),

    makeRegister("time", 0, 6, 0),

    makeRegister("π", Math.PI, 8, 0),
    makeRegister("2π", 2 * Math.PI, 9, 0),
    makeRegister("√2", Math.SQRT2, 8, 1),
    makeRegister("√2/2", Math.SQRT1_2, 9, 1),

    makeRegister("-1", -1, 8, 2),
    makeRegister("1", 1, 9, 2),
    makeRegister("0", 0, 8, 3),
    makeRegister("2", 2, 9, 3),
];

const emptyProgram = {
    source:{
        init:[
            {id:"a0", code:[]},
        ],
        loop:[
            {id:"b0", code:[]},
        ],
        pointerDown:[
            {id:"c0", code:[]},
        ],
        pointerUp:[
            {id:"d0", code:[]},
        ],
        pointerMove:[
            {id:"e0", code:[]},
        ],
    },
    registers:[
        ...defaultRegisters,
    ]
};

setProgram(emptyProgram);
