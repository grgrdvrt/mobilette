import { For, Switch, Match, Accessor, Setter } from "solid-js";

import { types, typesNames, defaultValues } from "../language";
import { hexToHSLA, hslaToHex } from "../utils";

export function DataInput(props: {
  type: Accessor<any>;
  setType: Setter<any>;
  value: Accessor<any>;
  setValue: Setter<any>;
}) {
  return (
    <div class="valueInput">
      <select
        name="types"
        id="types-select"
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value !== props.type()) {
            props.setValue(defaultValues[value]);
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
          <input
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
          <input
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
  );
}
