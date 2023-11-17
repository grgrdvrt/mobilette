import {
    createSignal,
    createEffect,
    createResource,
    untrack,
    on,
    For,
    Show,
    Switch,
    Match,
} from 'solid-js';
import {
    unwrap,
    reconcile
} from "solid-js/store";

import {
    useStore,
    resetRegisters,
    createEmptyProgram,
    setProgram,
} from "./store";
const [store, setStore] = useStore();

import {
    saveDocument,
    getDocuments,
    updateDocument,
    deleteDatabase,
} from "./db";


import {Interpreter} from "./interpreter";

import {Registers} from "./Registers";
import {Code} from "./Code";
import './App.css';


function Console({log}){
    let container;
    createEffect(on(log, () => {
        container.scrollTop = container.scrollHeight;
    }));
    return(
        <div ref={container} style={{height:"100%", overflow:"auto"}}>
          <For each={log().slice(-200)}>
            {(line) => <p>{line}</p>}
          </For>
        </div>
    );
}

function Editor() {

    resetRegisters();
    const [isPlaying, setIsPlaying] = createSignal(false);
    const [mode, setMode] = createSignal("code");
    const interpreter = new Interpreter((registers) => {
        setStore("program", "registers", reconcile(registers));
    });

    createEffect(() => {
        if(isPlaying()){
            untrack(() => {
                interpreter.initProgram(unwrap(store.program));
            });
            interpreter.play();
        }
        else{
            interpreter.pause();
        }
    });

    return (
        <div class="app">
          <div class="content">
            <Switch fallback={<div>Not Found</div>}>
              <Match when={mode() === "code"}>
                <Code source={store.program.source} registers={store.program.registers}/>
              </Match>
              <Match when={mode() === "registers"}>
                <Registers registers={store.program.registers}/>
              </Match>
              <Match when={mode() === "view"}>
                <div style={{width:"100%", height:"100%"}}>{
                    interpreter.mainCanvas
                }</div>
              </Match>
              <Match when={mode() === "console"}>
                <Console log={interpreter.stdOut}/>
              </Match>
            </Switch>
          </div>
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
            <button onClick={resetRegisters}>Reset</button>
          </div>
        </div>
    );
}

function Home({setPage}){
    const [documents] = createResource(getDocuments);
    return (
        <div style={{display:"flex", "flex-direction":"column", height:"50%", "justify-content":"space-between"}}>
          <div>
            <For each={documents()}>
              {(program) => {
                  return (
                      <button onClick={() => {
                          setProgram(program);
                          setPage("editor");
                      }}>{program.id}</button>
                  );
              }}
            </For>
          </div>
          <button onClick={() => {
              const program = createEmptyProgram();
              saveDocument(program);
              setProgram(program);
              setPage("editor");
          }}>new</button>
          <button onClick={() => deleteDatabase()}>clear</button>
        </div>
    );
}


function App(){
    const [page, setPage] = createSignal("home");

    return (
        <Show when={page() === "editor"} fallback={<Home setPage={setPage}/>}>
          <Editor/>
        </Show>
    );
}

export default App;
