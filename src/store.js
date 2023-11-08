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

export function setRegister(sourcePath, lineId, registerIndex, registerId){
    setStore(produce(store => {
        const line = store.program.source[sourcePath].find(l => l.id === lineId);
        line.code[registerIndex + 2] = `r:${registerId}`;
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

const defaultRegisters = [
    {id:"null", name:"null", initialValue:null, value:null, x:-1, y:-1, color:"hsl(0, 0%, 50%)"},
    {id:"width", name:"width", initialValue:0, value:0, x:0, y:0, color:"hsl(22, 46%, 91%)"},
    {id:"height", name:"height", initialValue:0, value:0, x:1, y:0, color:"hsl(227, 69%, 73%)"},
    {id:"time", name:"time", initialValue:0, value:0, x:2, y:0, color:"hsl(114, 30%, 66%)"},
    {id:"pointerX", name:"pointerX", initialValue:0, value:0, x:3, y:0, color:"hsl(22, 46%, 91%)"},
    {id:"pointerY", name:"pointerY", initialValue:0, value:0, x:4, y:0, color:"hsl(227, 69%, 73%)"},
    {id:"pPointerX", name:"pPointerX", initialValue:0, value:0, x:5, y:0, color:"hsl(22, 46%, 91%)"},
    {id:"pPointerY", name:"pPointerY", initialValue:0, value:0, x:6, y:0, color:"hsl(227, 69%, 73%)"},
]

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
        ...defaultRegisters,
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
            {id:"ed", code:["registers", "print", "r:pointerX"]},
        ],
    },
    registers:[
        ...defaultRegisters,
    ]
};

const bouncingProgram = {
    source:{
        init:[
            {id:"aa", code:["gfx", "fillStyle", "v:[0,0,0,1]"]},
            {id:"ad", code:["maths", "*", "r:width", "v:0.5", "r:x"]},
            {id:"ae", code:["maths", "*", "r:height", "v:0.5", "r:y"]},
            {id:"ab", code:["maths", "random", "v:-3", "v:3", "r:vx"]},
            {id:"ac", code:["maths", "random", "v:-3", "v:3", "r:vy"]},
            {id:"ad", code:["registers", "print", "r:vx"]},
            {id:"ae", code:["registers", "print", "r:vy"]},
        ],
        loop:[
            {id:"ba", code:["maths", "+", "r:x", "r:vx", "r:x"]},
            {id:"bb", code:["maths", "+", "r:y", "r:vy", "r:y"]},
            {id:"b//1", code:[]},
            {id:"bc", code:["maths", "-", "r:x", "r:c", "r:e"]},
            {id:"bd", code:["bool", "<", "r:e", "v:0", "r:bounce"]},
            {id:"be", code:["maths", "+", "r:x", "r:c", "r:e"]},
            {id:"bf", code:["bool", ">", "r:e", "r:width", "r:e"]},
            {id:"bh", code:["bool", "||", "r:bounce", "r:e", "r:bounce"]},
            {id:"bi", code:["ctrl", "if", "r:bounce"]},
            {id:"bj", code:["maths", "-", "v:0", "r:vx", "r:vx"]},
            {id:"bk", code:["ctrl", "endif"]},
            {id:"b//2", code:[]},
            {id:"bl", code:["maths", "-", "r:y", "r:c", "r:e"]},
            {id:"bm", code:["bool", "<", "r:e", "v:0", "r:bounce"]},
            {id:"bn", code:["maths", "+", "r:y", "r:c", "r:e"]},
            {id:"bo", code:["bool", ">", "r:e", "r:height", "r:e"]},
            {id:"bp", code:["bool", "||", "r:bounce", "r:e", "r:bounce"]},
            {id:"bq", code:["ctrl", "if", "r:bounce"]},
            {id:"br", code:["maths", "-", "v:0", "r:vy", "r:vy"]},
            {id:"bs", code:["ctrl", "endif"]},
            {id:"b//3", code:[]},
            {id:"bt", code:["gfx", "clear"]},
            {id:"bu", code:["gfx", "beginPath"]},
            {id:"bv", code:["gfx", "square", "r:x", "r:y", "r:c"]},
            {id:"bw", code:["gfx", "fill"]},
        ],
        pointerDown:[
        ],
        pointerUp:[
        ],
        pointerMove:[
        ],
    },
    registers:[
        ...defaultRegisters,
        {id:"c", name:"c", initialValue:100, value:100, x:0, y:2, color:"hsl(200, 62%, 63%)"},
        {id:"x", name:"x", initialValue:0, value:0, x:0, y:2, color:"hsl(352, 60%, 63%)"},
        {id:"y", name:"y", initialValue:0, value:0, x:1, y:2, color:"hsl(169, 60%, 54%)"},
        {id:"vx", name:"vx", initialValue:0, value:0, x:0, y:3, color:"hsl(352, 60%, 80%)"},
        {id:"vy", name:"vy", initialValue:0, value:0, x:1, y:3, color:"hsl(169, 60%, 80%)"},
        {id:"e", name:"e", initialValue:0, value:0, x:1, y:3, color:"hsl(169, 0%, 54%)"},
        {id:"bounce", name:"bounce", initialValue:0, value:0, x:1, y:3, color:"hsl(169, 30%, 54%)"},
    ]
};

const forProgram = {
    source:{
        init:[
            {id:"a1", code:["gfx", "fillStyle", "v:[0,0,0,1]"]},
            {id:"a2", code:["maths", "*", "r:width", "v:0.5", "r:x"]},
            {id:"a3", code:["maths", "*", "r:height", "v:0.5", "r:y"]},

            {id:"a4", code:["ctrl", "for", "r:i", "v:0", "v:10"]},
            {id:"a5", code:["gfx", "beginPath"]},
            // {id:"a6", code:["bool", "==", "v:3", "r:i", "r:cond"]},
            // {id:"a7", code:["ctrl", "if", "r:cond"]},
            // {id:"a8", code:["ctrl", "continue"]},
            // {id:"a9", code:["ctrl", "endif"]},
            {id:"a10", code:["bool", "==", "v:5", "r:i", "r:cond"]},
            {id:"a11", code:["ctrl", "if", "r:cond"]},
            {id:"a12", code:["ctrl", "break"]},
            {id:"a13", code:["ctrl", "endif"]},
            {id:"a14", code:["maths", "random", "v:0", "r:width", "r:x"]},
            {id:"a15", code:["maths", "random", "v:0", "r:height", "r:y"]},
            {id:"a16", code:["gfx", "square", "r:x", "r:y", "r:c"]},
            {id:"a17", code:["gfx", "fill"]},
            {id:"a18", code:["ctrl", "endfor"]},
        ],
        loop:[
        ],
        pointerDown:[
        ],
        pointerUp:[
        ],
        pointerMove:[
        ],
    },
    registers:[
        ...defaultRegisters,
        {id:"c", name:"c", initialValue:10, value:10, x:0, y:2, color:"hsl(200, 62%, 63%)"},
        {id:"x", name:"x", initialValue:0, value:0, x:0, y:2, color:"hsl(352, 60%, 63%)"},
        {id:"y", name:"y", initialValue:0, value:0, x:1, y:2, color:"hsl(169, 60%, 54%)"},
        {id:"i", name:"i", initialValue:0, value:0, x:0, y:3, color:"hsl(109, 60%, 54%)"},
        {id:"cond", name:"cond", initialValue:0, value:0, x:0, y:4, color:"hsl(109, 60%, 54%)"},
    ]
};

setProgram(greenRectProgram);
// setProgram(drawingProgram);
// setProgram(bouncingProgram);
// setProgram(forProgram);
