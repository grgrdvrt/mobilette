import { For, Switch, Match, Accessor, Setter } from "solid-js";

import { types, typesNames, defaultValues } from "../language/language";
import { hexToHSLA, hslaToHex } from "../utils";

import { HexColorPicker } from "solid-colorful";
import ColorPicker from "./ColorPicker";

export function ExpandedDataInput(props: {
  type: Accessor<any>;
  setType: Setter<any>;
  value: Accessor<any>;
  setValue: Setter<any>;
}) {
  return (
    <div class="expandedDataInput">
      <div class="typeSelector">
        <For
          each={Object.entries(typesNames).filter(
            ([key]) => key !== types.ANY.toString(),
          )}
        >
          {([key, value]) => {
            return (
              <button
                type="button"
                style={{
                  border:
                    Number(key) === props.type()
                      ? "solid 1px black"
                      : "solid 1px transparent",
                }} // Change based on selected state
                onClick={() => {
                  const valueNum = Number(key);
                  if (valueNum !== props.type()) {
                    props.setValue(defaultValues[valueNum]());
                    props.setType(valueNum);
                  }
                }}
              >
                {value}
              </button>
            );
          }}
        </For>
      </div>
      <div class="expandedValueInput">
        <Switch
          fallback={
            <input
              onInput={(e) => props.setValue(e.target.value)}
              value={props.value()}
            />
          }
        >
          <Match when={props.type() === types.BOOLEAN}>
            <select
              name="boolean"
              onChange={(e) => props.setValue(Number(e.target.value))}
            >
              <option value={1} selected={props.value() == 1}>
                True
              </option>
              <option value={0} selected={props.value() == 0}>
                False
              </option>
            </select>
          </Match>
          <Match when={props.type() === types.NUMBER}>
            <input
              type="number"
              onChange={(e) => props.setValue(JSON.parse(e.target.value))}
              value={JSON.stringify(props.value())}
            />
          </Match>
          <Match
            when={props.type() === types.ANY || props.type() === types.ARRAY}
          >
            <input
              onChange={(e) => props.setValue(JSON.parse(e.target.value))}
              value={JSON.stringify(props.value())}
            />
          </Match>
          <Match when={props.type() === types.COLOR}>
            <ColorPicker
              hsla={props.value()}
              onChange={(color) => {
                props.setValue(color);
              }}
            />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
