import { For, Switch, Match, Accessor, Setter } from "solid-js";

import { types, typesNames, defaultValues } from "../language/language";
import ColorPickerPopover from "./ColorPickerPopover";

export function CompactDataInput(props: {
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
          <ColorPickerPopover
            hsla={props.value()}
            onChange={(color) => props.setValue(color)}
          />
        </Match>
      </Switch>
    </div>
  );
}
