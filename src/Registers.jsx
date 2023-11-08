import { createSignal, Show, For} from 'solid-js';

import './App.css';

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
    return(
        <div class="registersGrid"
             onClick={(e) => {
                 const id = e.target.dataset?.register;
                 const register = registers.find(r => r.id === id);
                 if(register){onRegisterClicked(register);}
             }}
        >
          <For each={rows}>
            {j => {
                return (
                    <For each={cols}>
                      {i => {
                          const register = registers.find(r => r.x === i && r.y === j);
                          return (
                              <div
                              class="registerCell"
                                data-register={register?.id}
                                style={{"background-color":register?register.color:"#eeeeee"}}
                              />
                          );
                      }}
                    </For>
                );
            }}
          </For>
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

export function Registers({registers}){
    const [selectedRegister, setSelectedRegister] = createSignal(null);
    return(
        <div class="registers">
          <RegistersGrid registers={registers} onRegisterClicked={register => setSelectedRegister(register)}/>
          <Show when={selectedRegister() !== null}>
            <RegisterDetails register={selectedRegister()} onClose={() => setSelectedRegister(null)}/>
          </Show>
        </div>
    );
}
