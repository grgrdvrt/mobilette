import {
    For,
    createSignal,
    Switch,
    Match
} from 'solid-js';

import {
    getInput,
    setParameter,
} from "../store";

import {types, typesNames } from "../language";
import {hexToHSLA, hslaToHex} from "../utils";

const defaultValues={
    [types.ANY]:"0",
    [types.BOOLEAN]:"1",
    [types.NUMBER]:"0",
    [types.STRING]:"",
    [types.ARRAY]:"[]",
    [types.COLOR]:"[0,0,0,1]",
};
export function ValueInput({selectedInput, setSelectedInput}){


    const input = () => {
        return getInput(selectedInput.sourcePath, selectedInput.lineId, selectedInput.index);
    };

    const [type, setType] = createSignal(input().value.type??types.NUMBER);
    const [value, setValue] = createSignal(input()?.type === "value" ? (input().value.value ?? defaultValues[type()]) : "");

    let valueField;

    return(
        <div class="ValueInput">
          <select name="types" id="types-select" onChange={(e) => {
              const value = Number(e.target.value);
              if(value !== type){
                  setType(value);
                  setValue(defaultValues[type()]);
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
          <Switch fallback={<input ref={valueField} onInput={(e) => setValue(e.target.value)}id="registerValue" value={value()}/>}>
            <Match when={type() === types.BOOLEAN}>
              <select name="boolean" onChange={(e) => setValue(Number(e.target.value))}>
                <option value={1} selected={value() == 1}>True</option>
                <option value={0} selected={value() == 0}>False</option>
              </select>
            </Match>
            <Match when={type() === types.COLOR}>
              <input onChange={e => {
                  setValue(hexToHSLA(e.target.value));
              }} type="color" value={hslaToHex(...value())}/>
            </Match>
          </Switch>
          <button onClick={() => {
              const {sourcePath, lineId, index} = selectedInput;
              setParameter(sourcePath, lineId, index, "value", {type:type(), value:value()});
              setSelectedInput(null);
          }}>set</button>
        </div>
    );
}
