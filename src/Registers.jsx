import { createSignal, createMemo, Show, For} from 'solid-js';

import './App.css';
import {
    createRegister,
    getRegisterByPosition,
    makeEmptyRegister,
    saveRegister,
} from "./store";

function range(min, max){
    const result = [];
    for(let i = min; i < max; i++){
        result.push(i);
    }
    return result;
}

export function RegistersGrid({registers, onRegisterClicked}){
    const cols = range(0, 10);
    const rows = range(0, 10);
    const register = (x, y) => {
        return registers.find(r => r.x === x && r.y === y);
    };
    return(
        <div class="registersGrid"
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
    let valueField, colorField, nameField;
    return (
        <div class="registerDetails">
          <button onClick={() => onClose("close")}>Close</button>
          <p>{register().x}:{register().y}</p>
          <input ref={colorField} type="color" value={register().color}/>
          <p>type: number</p>

          <label for="registerValue">value</label>
          <input ref={valueField} id="registerValue" value={register().value??0}/>
          <br/>

          <label for="registerName">name</label>
          <input ref={nameField} id="registerName" value={register().name??""}/>
          <br/>

          <Show when={register().id === "empty"} fallback={
              <button
                onClick={
                    () => {
                        saveRegister(register().id, colorField.value, nameField.value, eval(valueField.value));
                        onClose("save");
                    }
                }>Save</button>
          }>
            <button onClick={() => onClose("cancel")}>Cancel</button>
            <button onClick={() => {
                createRegister(registerPosition.x, registerPosition.y, colorField.value, nameField.value, eval(valueField.value));
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
