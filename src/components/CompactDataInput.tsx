import { For, Switch, Match, Accessor, Setter } from "solid-js";

import { types, typesNames, defaultValues } from "../language/language";
import { hexToHSLA, hslaToHex } from "../utils";

export function CompactDataInput(props: {
  type: Accessor<any>;
  setType: Setter<any>;
  value: Accessor<any>;
  setValue: Setter<any>;
}) {
  return (
    <>
      <select
        class="typeSelect"
        name="types"
        id="types-select"
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value !== props.type()) {
            props.setValue(defaultValues[value]());
            props.setType(value);
          }
        }}
      >
        <For
          each={Object.entries(typesNames).filter(
            ([key]) => key !== types.ANY.toString(),
          )}
        >
          {([key, value]) => {
            return (
              <option
                value={key}
                selected={(() => props.type().toString() === key)()}
              >
                {value}
              </option>
            );
          }}
        </For>
      </select>
      <div class="valueSelector">
        <Switch
          fallback={
            <input
              onInput={(e) => props.setValue(e.target.value)}
              value={props.value()}
            />
          }
        >
          <Match when={props.type() === types.BOOLEAN}>
            <div class="booleanSelector compact">
              <button
                type="button"
                classList={{ selected: props.value() === 1 }}
                onClick={() => props.setValue(1)}
              >
                True
              </button>
              <button
                type="button"
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
            <input
              class="colorInput"
              onChange={(e) => {
                props.setValue(hexToHSLA(e.target.value, props.value()[3]));
              }}
              type="color"
              value={hslaToHex(
                props.value()[0],
                props.value()[1],
                props.value()[2],
              )}
            />
            <label class="alphaLabel">alpha</label>
            <input
              class="alphaInput"
              onChange={(e) =>
                props.setValue([
                  ...props.value().slice(0, 3),
                  JSON.parse(e.target.value),
                ])
              }
              value={JSON.stringify(props.value()[3])}
            />
          </Match>
        </Switch>
      </div>
    </>
  );
}
