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
    deleteSelection,
    getRegisterByPosition,
    setRegister
} from "./store";
const [store] = useStore();

import { RegisterDetails, RegistersGrid} from "./Registers";
import {InstructionsMenu} from "./InstructionsMenu";

function RegisterParam({register, setSelectedRegister, sourcePath, line, index}){
    return(
        <span
        class="codeRegister"
          style={{"background-color":register.color}}
          onClick={e => {
              e.stopPropagation();
              setSelectedRegister({sourcePath:sourcePath, lineId:line.id, register, index:index});
          }}
        >
          {register.name || register.y + ":" + register.x}
        </span>
    );
}


function ValueParam({value}){
    return(
        <span>{value}</span>
    );
}

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
                        <>
                          <Show when={p.substr(0, 2) === "r:"} fallback={<ValueParam value={item}/>}>
                              <RegisterParam
                                register={register}
                                setSelectedRegister={setSelectedRegister}
                                sourcePath={sourcePath}
                                line={line}
                                index={index()}
                              />
                            </Show>
                            <span> </span>
                        </>
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
    const hasSelection = () => {
        return store.gui.selection.length > 0;
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
          <Show when={hasSelection()}>
            <button class="codeDeleteBtn" onClick={deleteSelection}>Delete</button>
          </Show>
          <Show when={selectedRegister()}>
            <InputSelection
              registers={registers}
              selectedRegister={selectedRegister()}
              setSelectedRegister={setSelectedRegister}
            />
          </Show>
        </div>
    );
}

function InputSelection({registers, selectedRegister, setSelectedRegister}){
    const [step, setStep] = createSignal({id:"selection", data:{}});
    return(
        <div class="registerPicker">
          <Show when={step().id == "selection"}>
            <RegistersGrid
              registers={registers}
              onRegisterClicked={
                  registerPosition =>{
                      const register = getRegisterByPosition(registerPosition.x, registerPosition.y);
                      if(!register){
                          setStep({id:"creation", data:registerPosition});
                      }
                      else{
                          const {sourcePath, lineId, index} = selectedRegister;
                          setRegister(sourcePath, lineId, index, register.id);
                          setSelectedRegister(null);
                      }
                  }
              }
            />
          </Show>
          <Show when={step().id == "creation"}>
            <RegisterDetails
              registerPosition={step().data}
              onClose={(reason) => {
                  const {sourcePath, lineId, index} = selectedRegister;
                  if(reason === "create"){
                      const register = getRegisterByPosition(step().data.x, step().data.y);
                      setRegister(sourcePath, lineId, index, register.id);
                  }
                  setSelectedRegister(null);
              }}
            />
          </Show>
        </div>
    );
}
