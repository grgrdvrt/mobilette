import {
    For,
    createSignal,
    createEffect,
} from 'solid-js';

import {
    getInput,
    setParameter,
} from "../store";

import {types, typesNames } from "../language";

const defaultValues={
    [types.ANY]:"0",
    [types.BOOLEAN]:"1",
    [types.NUMBER]:"0",
    [types.STRING]:"",
    [types.ARRAY]:"[]",
    [types.COLOR]:"[0,0,0,1]",
};
export function ValueInput({selectedInput, setSelectedInput}){

    const [selectedType, setSelectedType] = createSignal(types.NUMBER);
    let valueField;

    const input = () => {
        return getInput(selectedInput.sourcePath, selectedInput.lineId, selectedInput.index);
    };

    // createEffect(() => {
    //     const {sourcePath, lineId, index} = selectedInput;
    //     setValue(sourcePath, lineId, index, defaultValues[selectedType()]);
    // });

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
          <input ref={valueField} id="registerValue" value={input()?.type === "value" ? input().value.value : ""}/>
          <button onClick={() => {
              const {sourcePath, lineId, index} = selectedInput;
              setParameter(sourcePath, lineId, index, "value", {type:selectedType(), value:valueField.value});
              setSelectedInput(null);
          }}>set</button>
        </div>
    );
}
