import { createSignal, createEffect, onMount, Show, Switch, Match, For} from 'solid-js';

import './App.css';

function range(min, max){
    const result = [];
    for(let i = min; i < max; i++){
        result.push(i);
    }
    return result;
}

export function Registers({registers}){
    const [selectedRegister, setSelectedRegister] = createSignal(null);
    const cols = range(0, 10);
    const rows = range(0, 10);
    return(
        <div class="registers">
            <div class="registersGrid">
            <For each={rows}>
                {j => {
                    return (
                        <For each={cols}>
                        {i => {
                            const register = registers.find(r => r.x === i && r.y === j);
                            return (
                                <div
                                class="registerCell"
                                  onClick={() => {if(register){setSelectedRegister(register);}}}
                                    style={{"background-color":register?register.color:"#eeeeee"}}
                                />
                            );
                        }}
                        </For>
                    );
                }}
            </For>
              <Show when={selectedRegister() !== null}>
                <RegisterDetails register={selectedRegister()} onClose={() => setSelectedRegister(null)}/>
              </Show>
            </div>
        </div>
    );
}


export function RegisterDetails({register, onClose}){
    return (
        <div class="registerDetails">
          <button onClick={onClose}>Close</button>
          <p>{register.x}:{register.y}</p>
          <div style={{width:"50px", height:"50px", "background-color":register.color}}></div>
          <p>type: number</p>
          <p>value: {register.value}</p>
          <p>name: {register.name||""}</p>
        </div>
    );
}
