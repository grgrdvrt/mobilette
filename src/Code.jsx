import {
    createSignal,
    createMemo,
    Show,
    For
} from 'solid-js';

import { useStore, insertAfter, setSelection, getSelectedLines } from "./store";
const [store] = useStore();

import {InstructionsMenu} from "./InstructionsMenu";

function SourceLine({line, selected, sourcePath, registers}){
    return (
        <div class={"sourceLine"} classList={{selected:selected()}}>
          <p onClick={() => selected() ? setSelection([]) : setSelection([line.id])} >
            <Show when={line.code.length} fallback={<p>//</p>}>
            {line.code[1]}<span> </span>
              <For each={line.code.slice(2)}>
                {p => {
                    const item = p.substr(2);
                    const register = registers.find(r => r.id === item);
                    return (
                        <Show when={p.substr(0, 2) === "r:"} fallback={<span>{item} </span>}>
                        <span style={{"background-color":register.color, "padding":"2px 3px", "border-radius":"3px"}}>
                            {register.name || register.y + ":" + register.x}
                        </span>
                        <span> </span>
                        </Show>
                    );
                }}
            </For>
            </Show>
            </p>
          <Show when={store.gui.selection.length === 1 && store.gui.selection[0] === line.id}>
            <button onClick={() => insertAfter(sourcePath, line.id)}>+</button>
          </Show>
        </div>
    );
}

function Program({source, sourcePath, registers}){
    const isSelected = (id) => {
        const isSelected = store.gui.selection.indexOf(id) !== -1;
        return isSelected;
    };
    return(
        <For each={source}>
          {line => {
              return(
                  <SourceLine
                    line={line}
                    sourcePath={sourcePath}
                    registers={registers}
                    selected={() => isSelected(line.id)}
                  />
              );
          }}
        </For>
    );
}
export function Code({source, registers}){
    const showInstruction = () => {
        const selectedLines = getSelectedLines();
        return selectedLines.length === 1 && selectedLines[0].code.length === 0;
    };
    return(
        <div class="code">
          <div class="codeList">
            <h3>Init</h3>
            <Program source={source.init} sourcePath="init" registers={registers}/>

            <hr/>
            <h3>Loop</h3>
            <Program source={source.loop} sourcePath="loop" registers={registers}/>

            <hr/>
            <h3>On Pointer Down</h3>
            <Program source={source.pointerDown} sourcePath="pointerDown" registers={registers}/>

            <hr/>
            <h3>On Pointer Up</h3>
            <Program source={source.pointerUp} sourcePath="pointerUp" registers={registers}/>

            <hr/>
            <h3>On Pointer Move</h3>
            <Program source={source.pointerMove} sourcePath="pointerMove" registers={registers}/>
          </div>
          <Show when={showInstruction()}>
            <InstructionsMenu/>
          </Show>
        </div>
    );
}
