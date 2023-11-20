import {
    createStore,
    produce,
    unwrap,
} from "solid-js/store";


import {
    updateDocument,
} from "./db";

import {types, instructionsDefinitions} from "./language";


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

    makeRegister("width", 0, 10, 6),
    makeRegister("height", 0, 11, 6),
    makeRegister("cx", 0, 10, 7),
    makeRegister("cy", 0, 11, 7),

    makeRegister("pointerX", 0, 13, 6),
    makeRegister("pointerY", 0, 14, 6),
    makeRegister("pPointerX", 0, 13, 7),
    makeRegister("pPointerY", 0, 14, 7),

    makeRegister("time", 0, 16, 6),

    makeRegister("π", Math.PI, 18, 6),
    makeRegister("2π", 2 * Math.PI, 19, 6),
    makeRegister("√2", Math.SQRT2, 18, 7),
    makeRegister("√2/2", Math.SQRT1_2, 19, 7),

    makeRegister("-1", -1, 18, 8),
    makeRegister("1", 1, 19, 8),
    makeRegister("0", 0, 18, 9),
    makeRegister("2", 2, 19, 9),
];

export function createEmptyProgram(){
    return {
        id:crypto.randomUUID(),
        lastOpened:Date.now(),
        source:{
            init:[],
            loop:[],
            pointerDown:[],
            pointerUp:[],
            pointerMove:[],
        },
        registers:[
            ...defaultRegisters,
        ]
    };
}

const [store, setStore] = createStore({
    gui:{
        cursor:{
            context:null,
            position:null,
        },
        selection:[],
        registers:{
            scrollTop:224,
            scrollLeft:376,
        }
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
    const newLineId = crypto.randomUUID();
    setStore(produce(store => {
        const source = store.program.source[sourcePath];
        const i = id === null ? 0 : source.findIndex(line => line.id === id);
        source.splice(i + (id === null ? 0 : 1), 0, {id:newLineId, code:[]});

    }));
    setSelection([newLineId]);
    autoSave();
}

export function insertAtIndex(sourcePath, index){
    setStore(produce(store => {
        const source = store.program.source[sourcePath];
        const newLineId = crypto.randomUUID();
        source.splice(index + 1, 0, {id:newLineId, code:[]});
        store.gui.selection = [newLineId];

    }));
    autoSave();
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
    autoSave();
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
    autoSave();
}

export function setValue(sourcePath, lineId, registerIndex, value){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code[registerIndex + 2] = `v:${value}`;
    }));
    autoSave();
}

export function setRegister(sourcePath, lineId, registerIndex, registerId){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code[registerIndex + 2] = `r:${registerId}`;
    }));
    autoSave();
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
            initialValue:value,
            value,
            color,
            x,
            y,
        };
        store.program.registers.push(register);
    }));
    autoSave();
}

export function saveRegister(id, type, color, name, value){
    setStore(produce(store => {
        const register = store.program.registers.find(r => r.id === id);
        register.type = type;
        register.color = color;
        register.name = name;
        register.initialValue = value,
        register.value = value;
    }));
    autoSave();
}

export function setSelection(ids){
    setStore("gui", "selection", ids);
    if(ids.length === 1){
        let cursor = undefined;
        const source = store.program.source;
        for(let context in source){
            
            const candidate = source[context].findIndex(l => l.id === ids[0]);
            if(candidate !== -1){
                cursor = {
                    context:context,
                    position:candidate,
                };
                break;
            }
        }
        if(cursor !== undefined){
            setStore("gui", "cursor", cursor);
        }
    }
    else{
        clearCursor();
    }
}

export function clearCursor(){
    setStore("gui", "cursor", "context", null);
}

export function clickContext(context){
    setStore("gui", "selection", []);
    if(store.gui.cursor.context === context && store.gui.cursor.position === -1){
        setStore("gui", "cursor", {context, position:null});
    }
    else{
        setStore("gui", "cursor", {context, position:-1});
    }
}

export function setCursor(context, position){
    setStore("gui", "cursor", {context, position});
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
    }));
    setSelection([]);
    autoSave();
}

function save(){
    updateDocument(unwrap(store.program));
}


let savedRecently;
let requestSave;
let saveTimeout;
function autoSave(){
    if(savedRecently){
        requestSave = true;
        return;
    }
    else{
        save();
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveTimeout = null;
            if(requestSave){
                save();
            }
            requestSave = false;
        }, 5000);
    }
}
