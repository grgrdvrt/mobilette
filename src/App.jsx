import {
    createSignal,
    createEffect,
    untrack,
    Show,
    Switch,
    Match,
} from 'solid-js';
import {
    createStore,
    produce,
    unwrap,
    reconcile
} from "solid-js/store";

import {Interpreter} from "./interpreter";

import {Registers} from "./Registers";
import {Code} from "./Code";
import './App.css';


function Console(){
    return(<div>Console</div>);
}


function App() {

    const [registers, setRegisters] = createStore([
        {id:"width", name:"width", initialValue:0, value:0, x:0, y:0, color:"hsl(22, 46%, 91%)"},
        {id:"height", name:"height", initialValue:0, value:0, x:1, y:0, color:"hsl(227, 69%, 73%)"},
        {id:"time", name:"time", initialValue:0, value:0, x:2, y:0, color:"hsl(114, 30%, 66%)"},
        {id:"margin", initialValue:50, value:50, x:0, y:1, color:"hsl(359, 70%, 50%)"},
        {id:"margin2", initialValue:0, value:0, x:1, y:1, color:"hsl(278, 14%, 59%)"},
        {id:"x", initialValue:0, value:0, x:0, y:2, color:"hsl(352, 62%, 63%)"},
        {id:"y", initialValue:0, value:0, x:1, y:2, color:"hsl(169, 57%, 54%)"},
        {id:"w", initialValue:0, value:0, x:2, y:2, color:"hsl(61, 51%, 96%)"},
        {id:"h", initialValue:0, value:0, x:3, y:2, color:"hsl(257, 79%, 77%)"},
        {id:"t", initialValue:0, value:0, x:4, y:2, color:"hsl(324, 61%, 84%)"},
    ]);
    function reset(){
        setRegisters(produce(registers => {
            registers.forEach(r => r.value = r.initialValue);
        }));
    }
    reset();
    const [source, setSource] = createStore({
        init:[
            ["color", "fill", "v:[100,100,50,1]"],
            ["maths", "*", "r:margin", "v:2", "r:margin2"],
            ["maths", "-", "r:width", "r:margin2", "r:w"],
            ["maths", "-", "r:height", "r:margin2", "r:h"],
            ["registers", "set", "r:x", "r:margin"],
            ["registers", "set", "r:y", "r:margin"],
        ],
        loop:[
            ["gfx", "clear"],
            ["maths", "*", "r:time", "v:0.001", "r:t"],
            ["maths", "cos", "r:t", "r:y"],
            ["maths", "*", "r:y", "r:margin", "r:y"],
            ["gfx", "rect", "r:x", "r:y", "r:w", "r:h"],
        ],
        pointerDown:[
            ["color", "fill", "v:[0,100,50,1]"],
        ],
        pointerUp:[
            ["color", "fill", "v:[100,100,50,1]"],
        ],
        pointerMove:[],
    });
    const [isPlaying, setIsPlaying] = createSignal(false);
    const [mode, setMode] = createSignal("code");
    const interpreter = new Interpreter((registers) => {
        setRegisters(reconcile(registers));
    });

    createEffect(() => {
        if(isPlaying()){
            untrack(() => {
                interpreter.initProgram(unwrap(source), unwrap(registers));
            });
            interpreter.play();
        }
        else{
            interpreter.pause();
        }
    });

    return (
        <div class="app">
          <div class="nav">
            <button onClick={() => setMode("code")}>Code</button>
            <button onClick={() => setMode("registers")}>Registers</button>
            <button onClick={() => setMode("view")}>View</button>
            <button onClick={() => setMode("console")}>Console</button>
            <button onClick={() => {
                if(!isPlaying()){
                    setMode("view");
                }
                setIsPlaying(!isPlaying());
            }}>
              <Show when={!isPlaying()} fallback="||">{">"}</Show>
            </button>
            <button onClick={reset}>Reset</button>
          </div>

          <div class="content">
            <Switch fallback={<div>Not Found</div>}>
              <Match when={mode() === "code"}>
                <Code source={source} registers={registers}/>
              </Match>
              <Match when={mode() === "registers"}>
                <Registers registers={registers}/>
              </Match>
              <Match when={mode() === "view"}>
                <div style={{width:"100%", height:"100%"}}>{
                    interpreter.mainCanvas
                }</div>
              </Match>
              <Match when={mode() === "console"}>
                <Console/>
              </Match>
            </Switch>
          </div>
        </div>
    );
}

export default App;
