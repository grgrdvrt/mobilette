import {
    Show,
    For,
    createSignal,
    createMemo,
} from 'solid-js';
import {
    Dynamic,
} from 'solid-js/web';

import {
    useStore,
    insertAfter,
    setSelection,
    getSelectedLines,
    getInput,
    deleteSelection,
    getRegisterByPosition,
    setRegister,
    setValue,
    addParameter,
    removeParameter,
} from "./store";
const [store] = useStore();

import { RegisterDetails, RegistersGrid} from "./Registers";
import {InstructionsMenu} from "./InstructionsMenu";

import {types, typesNames, instructionsDefinitions} from "./language";

function RegisterParam({register, setSelectedRegister, sourcePath, line, index}){
    return(
        <button
        class="codeRegister"
          style={{"background-color":register.color}}
          onClick={e => {
              e.stopPropagation();
              setSelectedRegister({sourcePath:sourcePath, lineId:line.id, register, index:index});
          }}
        >
          {register.name || register.y + ":" + register.x}
        </button>
    );
}

function ValueParam({value, register, setSelectedRegister, sourcePath, line, index}){
    return(
        <button
        class="codeRegister"
          style={{"border":"solid 1px black"}}
          onClick={e => {
              e.stopPropagation();
              setSelectedRegister({sourcePath:sourcePath, lineId:line.id, register:null, index:index});
          }}
        >
          {value}
        </button>
    );
}

function SourceLine({line, depth, selected, sourcePath, registers, setSelectedRegister}){
    const canAddParam = (line) => {
        if(!line.code.length)return false;
        const def = instructionsDefinitions[line.code[0]][line.code[1]];
        return line.code.length && def.params[def.params.length - 1].variadic;
    };
    const canRemoveParam = (line) => {
        if(!line.code.length)return false;
        const def = instructionsDefinitions[line.code[0]][line.code[1]];
        const isVariadic = def.params[def.params.length - 1].variadic;
        const canRemove = line.code.length > def.params.length;
        return isVariadic && canRemove;
    };
    return (
        <div class="sourceLine" classList={{selected:selected()}}>
          <p
            style={{"padding-left":15*depth()+"px"}}
            onClick={() => selected() ? setSelection([]) : setSelection([line.id])}
          >
            <Show when={line.code.length} fallback={<p>//</p>}>
              {line.code[1]}<span> </span>
              <For each={line.code.slice(2)}>
                {(p, index) => {
                    const item = p.substr(2);
                    const register = registers.find(r => r.id === item);
                    return (
                        <>
                          <Show when={p.substr(0, 2) === "r:"} fallback={<ValueParam value={item} register={register} setSelectedRegister={setSelectedRegister} sourcePath={sourcePath} line={line} index={index()}/>}>
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
              <Show when={(() => canAddParam(line))()}>
                <button onClick={() => addParameter(sourcePath, line.id)}>+</button>
              </Show>
              <Show when={(() => canRemoveParam(line))()}>
                <button onClick={() => removeParameter(sourcePath, line.id)}>-</button>
              </Show>
            </Show>
          </p>
          <Show when={store.gui.selection.length === 1 && store.gui.selection[0] === line.id}>
            <button class="insertionButton" onClick={() => insertAfter(sourcePath, line.id)}>+</button>
          </Show>
        </div>
    );
}

function Program({source, sourcePath, registers, setSelectedRegister}){
    const isSelected = (id) => {
        const isSelected = store.gui.selection.indexOf(id) !== -1;
        return isSelected;
    };
    const depths = createMemo(() => {
        let d = 0;
        return source.map(line => {
            let result;
            if(line.code[1] === "endif" || line.code[1] === "endfor"){
                d--;
            }
            result = d;
            if(line.code[1] === "if" || line.code[1] === "for"){
                d++;
            }
            return result;
        });
    });
    return(
        <For each={source}>
          {(line, i) => {
              return(
                  <SourceLine
                    line={line}
                    depth={() => depths()[i()]}
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

    const [selectedType, setSelectedType] = createSignal(types.NUMBER);
    let valueField;

    const input = () => {
        console.log("geg", selectedRegister.sourcePath, selectedRegister.lineId, selectedRegister.index, getInput(selectedRegister.sourcePath, selectedRegister.lineId, selectedRegister.index));
        return getInput(selectedRegister.sourcePath, selectedRegister.lineId, selectedRegister.index);
    };
    return(
        <div class="inputSelection">
          <div class="directValueInput">
            <select name="types" id="types-select" onInput={(e) => setSelectedType(Number(e.target.value))}>
              <For each={Object.entries(typesNames)}>
                {([key, value]) => {
                    return(
                        <option value={key} selected={(() => selectedType().toString() === key)()}>{value}</option>
                    );
                }}
              </For>
            </select>
            <input ref={valueField} id="registerValue" value={input()?.[0] === "v" ? input().substr(2) : ""}/>
            <button onClick={() => {
                const {sourcePath, lineId, index} = selectedRegister;
                setValue(sourcePath, lineId, index, eval(valueField.value));
                setSelectedRegister(null);
            }}>set</button>
          </div>
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
        </div>
    );
}
