import { For, Switch, Match, Accessor, Setter } from "solid-js";

import { types, typesNames, defaultValues } from "../language/language";

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
                class="typeButton"
                type="button"
                classList={{
                  selected: Number(key) === props.type(),
                }}
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
            <div class="booleanSelector">
              <button
                classList={{ selected: props.value() === 1 }}
                onClick={() => props.setValue(1)}
              >
                True
              </button>
              <button
                classList={{ selected: props.value() === 0 }}
                onClick={() => props.setValue(0)}
              >
                False
              </button>
            </div>
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
