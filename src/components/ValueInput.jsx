import {
    For,
    createSignal,
} from 'solid-js';

import {
    getInput,
    setValue,
} from "../store";

import {types, typesNames } from "../language";

export function ValueInput({selectedInput, setSelectedInput}){

    const [selectedType, setSelectedType] = createSignal(types.NUMBER);
    let valueField;

    const input = () => {
        return getInput(selectedInput.sourcePath, selectedInput.lineId, selectedInput.index);
    };

    return(
        <div class="ValueInput">
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
              const {sourcePath, lineId, index} = selectedInput;
              setValue(sourcePath, lineId, index, valueField.value);
              setSelectedInput(null);
          }}>set</button>
        </div>
    );
}
