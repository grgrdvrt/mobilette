import CodePicto from "./assets/article_FILL0_wght400_GRAD0_opsz24.svg";
// import RegistersPicto from "./assets/grid_view_FILL0_wght400_GRAD0_opsz24.svg";

import Logo from "./assets/logo2.webp";
import Title from "./assets/title.png";

import HomePicto from "./assets/home_FILL0_wght400_GRAD0_opsz24.svg";
import DeletePicto from "./assets/delete_FILL0_wght400_GRAD0_opsz24.svg";
import ForkPicto from "./assets/arrow_split_FILL0_wght400_GRAD0_opsz24.svg";
import PausePicto from "./assets/pause_circle_FILL0_wght400_GRAD0_opsz24.svg";
import PlayPicto from "./assets/play_circle_FILL0_wght400_GRAD0_opsz24.svg";
import ResetPicto from "./assets/replay_FILL0_wght400_GRAD0_opsz24.svg";
import ViewPicto from "./assets/shapes_FILL0_wght400_GRAD0_opsz24.svg";
import StopPicto from "./assets/stop_circle_FILL0_wght400_GRAD0_opsz24.svg";
import ConsolePicto from "./assets/terminal_FILL0_wght400_GRAD0_opsz24.svg";
import RegistersPicto from "./assets/view_module_FILL0_wght400_GRAD0_opsz24.svg";

import {
    createSignal,
    createSelector,
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
    setThumb,
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
                        setThumb(interpreter.mainCanvas);
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
                    interpreter.maincanvas
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
    const [selected, setSelected] = createSignal(null);
    const isSelected = createSelector(selected);
    return (
        <div class="home" onClick={() => setSelected(null)}>
          <h1 class="title">
            <img class="home-logo" src={Logo}/>
            <img class="home-title" src={Title}/>
          </h1>
          <div class="home-actions">
            <button class="home-action" onClick={() => {
            }}>About</button>
            <button class="home-action" onClick={() => {
                const program = createEmptyProgram();
                saveDocument(program);
                setProgram(program);
                setPage("editor");
            }}>new</button>
            <button class="home-action" onClick={() => {
                deleteDatabase();
            }}>clear</button>
          </div>
          <ol class="documentsList">
            <For each={documents()}>
              {(program) => {
                  return (
                      <li class="documentItem" classList={{selected:isSelected(program.id)}}>
                        <img src={program.thumb??"data:image/png;base64,"}
                        onClick={e => {
                            e.stopImmediatePropagation();
                            setSelected(program.id);
                        }}/>
                        <div class="documentItem-overlay">
                          <button onClick={() => {
                              setProgram(program);
                              setPage("editor");
                          }}> <img style={{height:"3.5em"}}src={PlayPicto}/></button>
                          <div class="documentItem-actions">
                            <button onClick={() => {deleteDocument(program.id); refetch();}}><img style={{"vertical-align":"middle"}}src={DeletePicto}/></button>
                            <button onClick={() => {
                                const p = JSON.parse(JSON.stringify(program));
                                p.id = crypto.randomUUID();
                                saveDocument(p);
                                setProgram(p);
                                setPage("editor");
                            }}><img style={{"vertical-align":"middle"}}src={ForkPicto}/></button>
                          </div>
                        </div>
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
