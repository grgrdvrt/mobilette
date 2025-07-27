import CodePicto from "../assets/article_FILL0_wght400_GRAD0_opsz24.svg";
// import RegistersPicto from "./assets/grid_view_FILL0_wght400_GRAD0_opsz24.svg";

import HomePicto from "../assets/home_FILL0_wght400_GRAD0_opsz24.svg";
import PausePicto from "../assets/pause_circle_FILL0_wght400_GRAD0_opsz24.svg";
import PlayPicto from "../assets/play_circle_FILL0_wght400_GRAD0_opsz24.svg";
import ResetPicto from "../assets/replay_FILL0_wght400_GRAD0_opsz24.svg";
import ViewPicto from "../assets/shapes_FILL0_wght400_GRAD0_opsz24.svg";
import StopPicto from "../assets/stop_circle_FILL0_wght400_GRAD0_opsz24.svg";
import ConsolePicto from "../assets/terminal_FILL0_wght400_GRAD0_opsz24.svg";
import RegistersPicto from "../assets/view_module_FILL0_wght400_GRAD0_opsz24.svg";

import {
  createSignal,
  createEffect,
  untrack,
  Show,
  Switch,
  Match,
  Setter,
} from "solid-js";
import { unwrap, reconcile } from "solid-js/store";

import {
  useStore,
  resetRegisters,
  setThumb,
  Registers as RegistersType,
} from "../store";

const [store, setStore] = useStore();

import { Interpreter } from "../language/interpreter";

import { Editor } from "../editor/Editor";
import { Registers } from "../registers/Registers";
import { ProgramConsole } from "../editor/Console";

export function EditorPage(props: { setPage: Setter<string> }) {
  resetRegisters();
  const [mode, setMode] = createSignal("code");
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [tab, setTab] = createSignal("code");
  const interpreter = new Interpreter((registers: RegistersType) => {
    setStore("program", "registers", reconcile(registers));
  });

  createEffect(() => {
    if (isPlaying()) {
      untrack(() => {
        interpreter.initProgram(unwrap(store.program));
      });
      interpreter.play();
    } else {
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
                <button onClick={() => setTab("code")}>
                  <img src={CodePicto} />
                </button>
                <button onClick={() => setTab("registers")}>
                  <img src={RegistersPicto} />
                </button>
              </div>

              <button onClick={() => props.setPage("home")}>
                <img src={HomePicto} />
              </button>

              <button
                onClick={() => {
                  setMode("play");
                  setTab("view");
                  setIsPlaying(true);
                }}
              >
                <img src={PlayPicto} />
              </button>
            </>
          </Match>
          <Match when={mode() === "play"}>
            <>
              <div>
                <button onClick={() => setTab("view")}>
                  <img src={ViewPicto} />
                </button>
                <button onClick={() => setTab("registers")}>
                  <img src={RegistersPicto} />
                </button>
                <button onClick={() => setTab("console")}>
                  <img src={ConsolePicto} />
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    if (mode() === "code") {
                      setMode("play");
                      setTab("view");
                    }
                    setIsPlaying(!isPlaying());
                  }}
                >
                  <Show when={isPlaying()} fallback={<img src={PlayPicto} />}>
                    <img src={PausePicto} />
                  </Show>
                </button>
                <button onClick={() => interpreter.play()}>
                  <img src={ResetPicto} />
                </button>
                <button
                  onClick={() => {
                    setMode("code");
                    setTab("code");
                    setIsPlaying(false);
                    resetRegisters();
                    if (!store.program.isExample) {
                      setThumb(interpreter.mainCanvas);
                    }
                  }}
                >
                  <img src={StopPicto} />
                </button>
              </div>
            </>
          </Match>
        </Switch>
      </div>
      <div class="content">
        <Switch fallback={<div>Not Found</div>}>
          <Match when={tab() === "code"}>
            <Editor
              source={store.program.source}
              registers={store.program.registers}
            />
          </Match>
          <Match when={tab() === "registers"}>
            <Registers registers={store.program.registers} />
          </Match>
          <Match when={tab() === "view"}>
            <div style={{ width: "100%", height: "100%" }}>
              {interpreter.mainCanvas}
            </div>
          </Match>
          <Match when={tab() === "console"}>
            <ProgramConsole log={interpreter.stdOut} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
