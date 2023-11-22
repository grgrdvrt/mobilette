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
    insertAtIndex,
    setSelection,
    getSelectedLines,
    deleteSelection,
    getRegisterByPosition,
    setParameter,
    addParameter,
    removeParameter,
    clickContext,
} from "./store";
const [store] = useStore();

import { RegisterDetails, RegistersGrid} from "./Registers";
import {InstructionsMenu} from "./InstructionsMenu";

import {instructionsDefinitions} from "./language";

import {ValueInput} from "./components/ValueInput";

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

function SourceLine({line, depth, selected, sourcePath, registers, setSelectedRegister, order}){
    const canAddParam = (line) => {
        if(!line.code.length)return false;
        const def = instructionsDefinitions[line.code[0]][line.code[1]];
        return def.params[def.params.length - 1]?.variadic;
    };
    const canRemoveParam = (line) => {
        if(!line.code.length)return false;
        const def = instructionsDefinitions[line.code[0]][line.code[1]];
        const isVariadic = def.params[def.params.length - 1]?.variadic;
        const canRemove = line.code.length > def.params.length;
        return isVariadic && canRemove;
    };
    return (
        <div class="sourceLine" classList={{selected:selected()}} style={{order:order}}>
          <p
            style={{"padding-left":15*depth()+"px"}}
            onClick={() => selected() ? setSelection([]) : setSelection([line.id])}
          >
            <Show when={line.code.length} fallback={<p>//</p>}>
              {line.code[1]}<span> </span>
              <For each={line.code.slice(2)}>
                {(p, index) => {
                    const item = p.value;
                    const register = registers.find(r => r.id === item);
                    return (
                        <>
                          <Show
                            when={p.type === "register"}
                            fallback={<ValueParam
                                        value={item}
                                        register={register}
                                        setSelectedRegister={setSelectedRegister}
                                        sourcePath={sourcePath}
                                        line={line}
                                        index={index()}/>}
                          >
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
              <Show when={selected()}>
                <Show when={(() => canAddParam(line))()}>
                  <button onClick={e => {
                      e.stopPropagation();
                      addParameter(sourcePath, line.id);
                  }}>+</button>
                </Show>
                <Show when={(() => canRemoveParam(line))()}>
                  <button onClick={e => {
                      e.stopPropagation();
                      removeParameter(sourcePath, line.id);
                  }}>-</button>
                </Show>
              </Show>
            </Show>
          </p>
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
        <div style={{display:"flex", "flex-direction":"column"}}>
          <Show when={store.gui.cursor.context === sourcePath && store.gui.cursor.position === -1}>
            <button
        class="insertionButton"
              onClick={() => insertAfter(sourcePath, null)}
            >
              +
            </button>
          </Show>
          <For each={source}>
            {(line, i) => {
                return(
                    <>
                      <SourceLine
                        line={line}
                        depth={() => depths()[i()]}
                        sourcePath={sourcePath}
                        registers={registers}
                        selected={() => isSelected(line.id)}
                        setSelectedRegister={setSelectedRegister}
                      />
                      <Show when={store.gui.cursor.context === sourcePath && store.gui.cursor.position === i()}>
                        <button
                            class="insertionButton"
                          onClick={() => insertAfter(sourcePath, line.id)}
                        >
                          +
                        </button>
                      </Show>
                    </>
                );
            }}
          </For>
        </div>
    );
}
export function Code({source, registers}){
    const [selectedInput, setSelectedInput] = createSignal(null);
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
            <h3 onClick={() => clickContext("init")}>Init</h3>
            <Program
              source={source.init}
              sourcePath="init"
              registers={registers}
              setSelectedRegister={setSelectedInput}
            />

            <hr/>
            <h3 onClick={() => clickContext("loop")}>Loop</h3>
            <Program
              source={source.loop}
              sourcePath="loop"
              registers={registers}
              setSelectedRegister={setSelectedInput}
            />

            <hr/>
            <h3 onClick={() => clickContext("pointerDown")}>On Pointer Down</h3>
            <Program
              source={source.pointerDown}
              sourcePath="pointerDown"
              registers={registers}
              setSelectedRegister={setSelectedInput}
            />

            <hr/>
            <h3></h3>
            <h3 onClick={() => clickContext("pointerUp")}>On Pointer Up</h3>
            <Program
              source={source.pointerUp}
              sourcePath="pointerUp"
              registers={registers}
              setSelectedRegister={setSelectedInput}
            />

            <hr/>
            <h3 onClick={() => clickContext("pointerMove")}>On Pointer Move</h3>
            <Program
              source={source.pointerMove}
              sourcePath="pointerMove"
              registers={registers}
              setSelectedRegister={setSelectedInput}/>
          </div>
          <Show when={showInstruction()}>
            <InstructionsMenu/>
          </Show>
          <Show when={hasSelection()}>
            <button class="codeDeleteBtn" onClick={deleteSelection}>Delete</button>
          </Show>
          <Show when={selectedInput()}>
            <InputSelection
              registers={registers}
              selectedInput={selectedInput()}
              setSelectedInput={setSelectedInput}
            />
          </Show>
        </div>
    );
}

function InputSelection({registers, selectedInput, setSelectedInput}){
    const [step, setStep] = createSignal({id:"selection", data:{}});

    return(
        <div class="inputSelection">
          <ValueInput selectedInput={selectedInput} setSelectedInput={setSelectedInput}/>
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
                            const {sourcePath, lineId, index} = selectedInput;
                            setParameter(sourcePath, lineId, index, "register", register.id);
                            setSelectedInput(null);
                        }
                    }
                }
              />
            </Show>
            <Show when={step().id == "creation"}>
              <RegisterDetails
                registerPosition={step().data}
                onClose={(reason) => {
                    const {sourcePath, lineId, index} = selectedInput;
                    if(reason === "create"){
                        const register = getRegisterByPosition(step().data.x, step().data.y);
                        setParameter(sourcePath, lineId, index, "register", register.id);
                    }
                    setSelectedInput(null);
                }}
              />
            </Show>
          </div>
        </div>
    );
}
