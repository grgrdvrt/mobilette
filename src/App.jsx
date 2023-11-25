import CodePicto from "./assets/article_FILL0_wght400_GRAD0_opsz24.svg";
// import RegistersPicto from "./assets/grid_view_FILL0_wght400_GRAD0_opsz24.svg";

import Logo from "./assets/logo.webp";

import HomePicto from "./assets/home_FILL0_wght400_GRAD0_opsz24.svg";
import ClosePicto from "./assets/close_FILL0_wght400_GRAD0_opsz24.svg";
import PausePicto from "./assets/pause_circle_FILL0_wght400_GRAD0_opsz24.svg";
import PlayPicto from "./assets/play_circle_FILL0_wght400_GRAD0_opsz24.svg";
import ResetPicto from "./assets/replay_FILL0_wght400_GRAD0_opsz24.svg";
import ViewPicto from "./assets/shapes_FILL0_wght400_GRAD0_opsz24.svg";
import StopPicto from "./assets/stop_circle_FILL0_wght400_GRAD0_opsz24.svg";
import ConsolePicto from "./assets/terminal_FILL0_wght400_GRAD0_opsz24.svg";
import RegistersPicto from "./assets/view_module_FILL0_wght400_GRAD0_opsz24.svg";

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
    deleteDocument,
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

function Editor({setPage}) {

    resetRegisters();
    const [mode, setMode] = createSignal("code");
    const [isPlaying, setIsPlaying] = createSignal(false);
    const [tab, setTab] = createSignal("code");
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
          <div class="nav">
            <Switch fallback={<div>Not Found</div>}>
              <Match when={mode() === "code"}>
                <>

                  <div>
                    <button onClick={() => setTab("code")}><img src={CodePicto} /></button>
                    <button onClick={() => setTab("registers")}><img src={RegistersPicto}/></button>
                  </div>

                  <button onClick={() => setPage("home")}><img src={HomePicto} /></button>

                  <button onClick={() => {
                      setMode("play");
                      setTab("view");
                      setIsPlaying(true);
                  }}>
                    <img src={PlayPicto}/>
                  </button>
                </>
              </Match>
              <Match when={mode() === "play"}>
                <>
                  <div>
                    <button onClick={() => setTab("view")}><img src={ViewPicto}/></button>
                    <button onClick={() => setTab("registers")}><img src={RegistersPicto}/></button>
                    <button onClick={() => setTab("console")}><img src={ConsolePicto}/></button>
                  </div>
                  <div>
                    <button onClick={() => {
                        if(mode() === "code"){
                            setMode("play");
                            setTab("view");
                        }
                        setIsPlaying(!isPlaying());
                    }}>
                      <Show when={isPlaying()} fallback={
                          <img src={PlayPicto}/>
                      }><img src={PausePicto}/></Show>
                    </button>
                    <button onClick={() => interpreter.play()}>
                      <img src={ResetPicto}/>
                    </button>
                    <button onClick={() => {
                        setMode("code");
                        setTab("code");
                        setIsPlaying(false);
                        resetRegisters();
                    }}>
                      <img src={StopPicto}/>
                    </button>
                  </div>
                </>
              </Match>
            </Switch>
          </div>
          <div class="content">
            <Switch fallback={<div>Not Found</div>}>
              <Match when={tab() === "code"}>
                <Code source={store.program.source} registers={store.program.registers}/>
              </Match>
              <Match when={tab() === "registers"}>
                <Registers registers={store.program.registers}/>
              </Match>
              <Match when={tab() === "view"}>
                <div style={{width:"100%", height:"100%"}}>{
                    interpreter.mainCanvas
                }</div>
              </Match>
              <Match when={tab() === "console"}>
                <Console log={interpreter.stdOut}/>
              </Match>
            </Switch>
          </div>
        </div>
    );
}

function Home({setPage}){
    const [documents, {refetch}] = createResource(getDocuments);
    return (
        <div class="home">
          <h1 class="title">Mobilette</h1>
          <img class="home-logo" src={Logo}/>
          <button class="home-new" onClick={() => {
              const program = createEmptyProgram();
              saveDocument(program);
              setProgram(program);
              setPage("editor");
          }}>new</button>
          <ol class="documentsList">
            <For each={documents()}>
              {(program) => {
                  return (
                      <li class="documentItem">
                        <button onClick={() => {
                            setProgram(program);
                            setPage("editor");
                        }}>{new Date(program.lastOpened).toUTCString()}</button>
                        <button onClick={() => {deleteDocument(program.id); refetch();}}><img style={{"vertical-align":"middle"}}src={ClosePicto}/></button>
                      </li>
                  );
              }}
            </For>
          </ol>
        </div>
    );
}


function App(){
    const [page, setPage] = createSignal("home");

    return (
        <Show when={page() === "editor"} fallback={<Home setPage={setPage}/>}>
          <Editor setPage={setPage}/>
        </Show>
    );
}

export default App;
