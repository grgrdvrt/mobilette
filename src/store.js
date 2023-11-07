import {
    createStore,
    produce,
    unwrap,
} from "solid-js/store";

import {instructionsDefinitions} from "./language";

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
            if(store.gui.selection.indexOf(line.id) !== -1){
                lines.push(line);
            }
        });
    }
    return lines;
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

export function setSelection(ids){
    setStore(produce(store => {
        store.gui.selection = ids;
    }));
}

export function addToSelection(id){
    setStore(produce(store => {
        store.gui.selection.push(id);
    }));
}

//init
const greenRectProgram = {
    source:{
        init:[
            {id:"aa", code:["gfx", "fillStyle", "v:[100,100,50,1]"]},
            {id:"ab", code:[]},
            {id:"ac", code:["maths", "*", "r:margin", "v:2", "r:margin2"]},
            {id:"ad", code:["maths", "-", "r:width", "r:margin2", "r:w"]},
            {id:"ae", code:["maths", "-", "r:height", "r:margin2", "r:h"]},
            {id:"af", code:["registers", "set", "r:x", "r:margin"]},
            {id:"ag", code:["registers", "set", "r:y", "r:margin"]},
        ],
        loop:[
            {id:"ba", code:["gfx", "clear"]},
            {id:"bb", code:["maths", "*", "r:time", "v:0.001", "r:t"]},
            {id:"bc", code:["maths", "cos", "r:t", "r:y"]},
            {id:"bd", code:["maths", "*", "r:y", "r:margin", "r:y"]},
            {id:"be", code:["gfx", "beginPath"]},
            {id:"be", code:["gfx", "rect", "r:x", "r:y", "r:w", "r:h"]},
            {id:"bf", code:["gfx", "fill"]},
            {id:"bg", code:["registers", "print", "r:y"]},
        ],
        pointerDown:[
            {id:"ca", code:["gfx", "fillStyle", "v:[0,100,50,1]"]},
        ],
        pointerUp:[
            {id:"da", code:["gfx", "fillStyle", "v:[100,100,50,1]"]},
        ],
        pointerMove:[],
    },
    registers:[
        {id:"null", name:"null", initialValue:null, value:null, x:-1, y:-1, color:"hsl(0, 0%, 50%)"},
        {id:"width", name:"width", initialValue:0, value:0, x:0, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"height", name:"height", initialValue:0, value:0, x:1, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"time", name:"time", initialValue:0, value:0, x:2, y:0, color:"hsl(114, 30%, 66%)"},
        {id:"pointerX", name:"pointerX", initialValue:0, value:0, x:3, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"pointerY", name:"pointerY", initialValue:0, value:0, x:4, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"pPointerX", name:"pPointerX", initialValue:0, value:0, x:5, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"pPointerY", name:"pPointerY", initialValue:0, value:0, x:6, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"margin", initialValue:50, value:50, x:0, y:1, color:"hsl(359, 70%, 50%)"},
        {id:"margin2", initialValue:0, value:0, x:1, y:1, color:"hsl(278, 14%, 59%)"},
        {id:"x", initialValue:0, value:0, x:0, y:2, color:"hsl(352, 62%, 63%)"},
        {id:"y", initialValue:0, value:0, x:1, y:2, color:"hsl(169, 57%, 54%)"},
        {id:"w", initialValue:0, value:0, x:2, y:2, color:"hsl(61, 51%, 96%)"},
        {id:"h", initialValue:0, value:0, x:3, y:2, color:"hsl(257, 79%, 77%)"},
        {id:"t", initialValue:0, value:0, x:4, y:2, color:"hsl(324, 61%, 84%)"},
    ]
};

const drawingProgram = {
    source:{
        init:[
            {id:"aa", code:["gfx", "strokeStyle", "v:[0,0,0,1]"]},
        ],
        loop:[
        ],
        pointerDown:[
        ],
        pointerUp:[
        ],
        pointerMove:[
            {id:"ea", code:["gfx", "beginPath"]},
            {id:"eb", code:["gfx", "moveTo", "r:pPointerX", "r:pPointerY"]},
            {id:"ec", code:["gfx", "lineTo", "r:pointerX", "r:pointerY"]},
            {id:"ed", code:["gfx", "stroke"]},
        ],
    },
    registers:[
        {id:"null", name:"null", initialValue:null, value:null, x:-1, y:-1, color:"hsl(0, 0%, 50%)"},
        {id:"width", name:"width", initialValue:0, value:0, x:0, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"height", name:"height", initialValue:0, value:0, x:1, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"time", name:"time", initialValue:0, value:0, x:2, y:0, color:"hsl(114, 30%, 66%)"},
        {id:"pointerX", name:"pointerX", initialValue:0, value:0, x:3, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"pointerY", name:"pointerY", initialValue:0, value:0, x:4, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"pPointerX", name:"pPointerX", initialValue:0, value:0, x:5, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"pPointerY", name:"pPointerY", initialValue:0, value:0, x:6, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"margin", initialValue:50, value:50, x:0, y:1, color:"hsl(359, 70%, 50%)"},
        {id:"margin2", initialValue:0, value:0, x:1, y:1, color:"hsl(278, 14%, 59%)"},
        {id:"x", initialValue:0, value:0, x:0, y:2, color:"hsl(352, 62%, 63%)"},
        {id:"y", initialValue:0, value:0, x:1, y:2, color:"hsl(169, 57%, 54%)"},
        {id:"w", initialValue:0, value:0, x:2, y:2, color:"hsl(61, 51%, 96%)"},
        {id:"h", initialValue:0, value:0, x:3, y:2, color:"hsl(257, 79%, 77%)"},
        {id:"t", initialValue:0, value:0, x:4, y:2, color:"hsl(324, 61%, 84%)"},
    ]
};

setProgram(greenRectProgram);
// setProgram(drawingProgram);
