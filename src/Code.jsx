import {
    Show,
    For,
    createSignal,
} from 'solid-js';

import {
    useStore,
    insertAfter,
    setSelection,
    getSelectedLines,
    setRegister
} from "./store";
const [store] = useStore();

import {RegistersGrid} from "./Registers";
import {InstructionsMenu} from "./InstructionsMenu";

function SourceLine({line, selected, sourcePath, registers, setSelectedRegister}){
    return (
        <div class="sourceLine" classList={{selected:selected()}}>
          <p onClick={() => selected() ? setSelection([]) : setSelection([line.id])} >
            <Show when={line.code.length} fallback={<p>//</p>}>
              {line.code[1]}<span> </span>
              <For each={line.code.slice(2)}>
                {(p, index) => {
                    const item = p.substr(2);
                    const register = registers.find(r => r.id === item);
                    return (
                        <Show when={p.substr(0, 2) === "r:"} fallback={<span>{item} </span>}>
                          <span
                            class="codeRegister"
                            style={{"background-color":register.color}}
                            onClick={e => {
                                e.stopPropagation();
                                setSelectedRegister({sourcePath:sourcePath, lineId:line.id, register, index:index()});
                            }}
                          >
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

function Program({source, sourcePath, registers, setSelectedRegister}){
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
                    setSelectedRegister={setSelectedRegister}
                  />
              );
          }}
        </For>
    );
}
export function Code({source, registers}){
    const [selectedRegister, setSelectedRegister] = createSignal(null);
    const showInstruction = () => {
        const selectedLines = getSelectedLines();
        return selectedLines.length === 1 && selectedLines[0].code.length === 0;
    };
    return(
        <div class="code">
          <div class="codeList">
            <h3>Init</h3>
            <Program
              source={source.init}
              sourcePath="init"
              registers={registers}
              setSelectedRegister={setSelectedRegister}
            />

            <hr/>
            <h3>Loop</h3>
            <Program
              source={source.loop}
              sourcePath="loop"
              registers={registers}
              setSelectedRegister={setSelectedRegister}
            />

            <hr/>
            <h3>On Pointer Down</h3>
            <Program
              source={source.pointerDown}
              sourcePath="pointerDown"
              registers={registers}
              setSelectedRegister={setSelectedRegister}
            />

            <hr/>
            <h3>On Pointer Up</h3>
            <Program
              source={source.pointerUp}
              sourcePath="pointerUp"
              registers={registers}
              setSelectedRegister={setSelectedRegister}
            />

            <hr/>
            <h3>On Pointer Move</h3>
            <Program
              source={source.pointerMove}
              sourcePath="pointerMove"
              registers={registers}
              setSelectedRegister={setSelectedRegister}/>
          </div>
          <Show when={showInstruction()}>
            <InstructionsMenu/>
          </Show>
          <Show when={selectedRegister()}>
            <div class="registerPicker">
              <RegistersGrid
                registers={registers}
                onRegisterClicked={
                    register =>{
                        const {sourcePath, lineId, index} = selectedRegister();
                        setRegister(sourcePath, lineId, index, register.id);
                        setSelectedRegister(null);
                    }
                }
              />
            </div>
          </Show>
        </div>
    );
}
