import {
    createSignal,
    createMemo,
    Show,
    For,
    onMount,
    onCleanup,
} from 'solid-js';
import {produce} from 'solid-js/store';

import './App.css';
import {
    createRegister,
    getRegisterByPosition,
    makeEmptyRegister,
    saveRegister,
    useStore
} from "./store";
const [store, setStore] = useStore();

import {types, typesNames, defaultValues} from "./language";

import {DataInput} from "./components/ValueInput";

function range(min, max){
    const result = [];
    for(let i = min; i < max; i++){
        result.push(i);
    }
    return result;
}

export function RegistersGrid({registers, onRegisterClicked}){
    let el;
    const cols = range(0, 10);
    const rows = range(0, 40);
    const register = (x, y) => {
        return registers.find(r => r.x === x && r.y === y);
    };
    onMount(() => {
        el.scrollTop = store.gui.registers.scrollTop;
        el.scrollLeft = store.gui.registers.scrollLeft;
    });
    onCleanup(() => {
        setStore(produce(store => {
            store.gui.registers.scrollTop = el.scrollTop;
            store.gui.registers.scrollLeft = el.scrollLeft;
        }));
    });
    return(
        <div ref={el} class="registersGrid"
             onClick={(e) => {
                 const x = e.target.dataset?.x;
                 const y = e.target.dataset?.y;
                 if(x && y){onRegisterClicked({
                     x:Number(x),
                     y:Number(y),
                 });}
             }}
        >
          <For each={rows}>
            {j => {
                return (
                    <For each={cols}>
                      {i => {
                          return (
                              <div
                              class="registerCell"
                                data-x={i}
                                data-y={j}
                                style={{"background-color":register(i, j)?register(i, j).color:"#eeeeee"}}
                              >{register(i, j)?.name?.substr(0, 3)}</div>
                          );
                      }}
                    </For>
                );
            }}
          </For>
        </div>
    );
}

export function RegisterDetails({registerPosition, onClose}){
    const register = createMemo(() => {
        return getRegisterByPosition(registerPosition.x, registerPosition.y) || makeEmptyRegister(registerPosition.x, registerPosition.y);
    });
    const [type, setType] = createSignal(register().type??types.NUMBER);
    const [value, setValue] = createSignal(register().value.value ?? defaultValues[type()]);
    let colorField, nameField;
    return (
        <div class="registerDetails">
          <button onClick={() => onClose("close")}>Close</button>
          <p>{register().x}:{register().y}</p>

          <input ref={colorField} type="color" value={register().color}/>

          <DataInput type={type} setType={setType} value={value} setValue={setValue}/>

          <label for="registerName">name</label>
          <input ref={nameField} id="registerName" value={register().name??""}/>
          <br/>

          <Show when={register().id === "empty"} fallback={
              <button
                onClick={
                    () => {
                        saveRegister(register().id, type(), colorField.value, nameField.value, value());
                        onClose("save");
                    }
                }>Save</button>
          }>
            <button onClick={() => onClose("cancel")}>Cancel</button>
            <button onClick={() => {
                createRegister(registerPosition.x, registerPosition.y, type(), colorField.value, nameField.value, value());
                onClose("create");
            }}>Create</button>
          </Show>
        </div>
    );
}

export function Registers({registers}){
    const [selectedRegister, setSelectedRegisiter] = createSignal(null);
    return(
        <div class="registers">
          <RegistersGrid
            registers={registers}
            onRegisterClicked={registerPosition => {
                setSelectedRegisiter(registerPosition);
            }}
          />
          <Show when={selectedRegister() !== null}>
            <RegisterDetails
              registerPosition={selectedRegister()}
              onClose={() => setSelectedRegisiter(null)}
            />
          </Show>
        </div>
    );
}
