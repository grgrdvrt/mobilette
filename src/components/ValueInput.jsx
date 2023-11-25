import {
    For,
    createSignal,
    Switch,
    Match,
} from 'solid-js';

import {
    getInput,
    setParameter,
} from "../store";

import {types, typesNames, defaultValues } from "../language";
import {hexToHSLA, hslaToHex} from "../utils";


export function DataInput({type, setType, value, setValue}){

    let valueField;

    return(
        <div class="valueInput">
          <select name="types" id="types-select" onChange={(e) => {
              const value = Number(e.target.value);
              if(value !== type()){
                  setValue(defaultValues[value]);
                  setType(value);
              }
          }}>
            <For each={Object.entries(typesNames)}>
              {([key, value]) => {
                  return(
                      <option value={key} selected={(() => type().toString() === key)()}>{value}</option>
                  );
              }}
            </For>
          </select>
          <Switch fallback={<input ref={valueField} onInput={(e) => setValue(e.target.value)} value={value()}/>}>
            <Match when={type() === types.BOOLEAN}>
              <select name="boolean" onChange={(e) => setValue(Number(e.target.value))}>
                <option value={1} selected={value() == 1}>True</option>
                <option value={0} selected={value() == 0}>False</option>
              </select>
            </Match>
            <Match when={type() === types.NUMBER || type() === types.ARRAY}>
              <input
                ref={valueField}
                onInput={(e) => setValue(JSON.parse(e.target.value))}
                value={JSON.stringify(value())}
              />
            </Match>
            <Match when={type() === types.COLOR}>
              <input onChange={e => {
                  setValue(hexToHSLA(e.target.value));
              }} type="color" value={hslaToHex(...value())}/>
            </Match>
          </Switch>
        </div>
    );
}
