import { For, createSignal, Switch, Match } from "solid-js";

import { getInput, setParameter } from "../store";

import { types, typesNames, defaultValues } from "../language";
import { hexToHSLA, hslaToHex } from "../utils";

export function DataInput({ type, setType, value, setValue }) {
  return (
    <div class="valueInput">
      <select
        name="types"
        id="types-select"
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value !== type()) {
            setValue(defaultValues[value]);
            setType(value);
          }
        }}
      >
        <For each={Object.entries(typesNames)}>
          {([key, value]) => {
            return (
              <option
                value={key}
                selected={(() => type().toString() === key)()}
              >
                {value}
              </option>
            );
          }}
        </For>
      </select>
      <Switch
        fallback={
          <input onInput={(e) => setValue(e.target.value)} value={value()} />
        }
      >
        <Match when={type() === types.BOOLEAN}>
          <select
            name="boolean"
            onChange={(e) => setValue(Number(e.target.value))}
          >
            <option value={1} selected={value() == 1}>
              True
            </option>
            <option value={0} selected={value() == 0}>
              False
            </option>
          </select>
        </Match>
        <Match
          when={
            type() === types.ANY ||
            type() === types.NUMBER ||
            type() === types.ARRAY
          }
        >
          <input
            onChange={(e) => setValue(JSON.parse(e.target.value))}
            value={JSON.stringify(value())}
          />
        </Match>
        <Match when={type() === types.COLOR}>
          <input
            onChange={(e) => {
              setValue(hexToHSLA(e.target.value, value()[3]));
            }}
            type="color"
            value={hslaToHex(...value())}
          />
          <input
            onChange={(e) =>
              setValue([...value().slice(0, 3), JSON.parse(e.target.value)])
            }
            value={JSON.stringify(value()[3])}
          />
        </Match>
      </Switch>
    </div>
  );
}
