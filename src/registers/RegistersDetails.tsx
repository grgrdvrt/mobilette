import { createSignal, createMemo, Show } from "solid-js";

import {
  createRegister,
  getRegisterByPosition,
  makeEmptyRegister,
  saveRegister,
} from "../store";

import ClosePicto from "../assets/close_FILL0_wght400_GRAD0_opsz24.svg";

import { types, defaultValues } from "../language/language";

import { DataInput } from "../components/DataInput";

export type RegisterDetailsCloseReasons =
  | "close"
  | "save"
  | "create"
  | "cancel";

export function RegisterDetails(props: {
  registerPosition: { x: number; y: number };
  onClose: (reason: RegisterDetailsCloseReasons) => void;
}) {
  const register = createMemo(() => {
    return (
      getRegisterByPosition(
        props.registerPosition.x,
        props.registerPosition.y,
      ) || makeEmptyRegister(props.registerPosition.x, props.registerPosition.y)
    );
  });
  const [type, setType] = createSignal(register().type ?? types.NUMBER);
  const [value, setValue] = createSignal(
    register().value ?? defaultValues[type()](),
  );
  let colorField, nameField;
  return (
    <div class="registerDetails">
      <button onClick={() => props.onClose("close")}>
        <img src={ClosePicto} />
      </button>
      <p>
        {register().x}:{register().y}
      </p>

      <input ref={colorField} type="color" value={register().color} />

      <DataInput
        type={type}
        setType={setType}
        value={value}
        setValue={setValue}
      />

      <label for="registerName">name</label>
      <input ref={nameField} id="registerName" value={register().name ?? ""} />
      <br />

      <Show
        when={register().id === "empty"}
        fallback={
          <button
            onClick={() => {
              saveRegister(
                register().id,
                type(),
                colorField!.value,
                nameField!.value,
                value(),
              );
              props.onClose("save");
            }}
          >
            Save
          </button>
        }
      >
        <button onClick={() => props.onClose("cancel")}>Cancel</button>
        <button
          onClick={() => {
            createRegister(
              props.registerPosition.x,
              props.registerPosition.y,
              type(),
              colorField!.value,
              nameField!.value,
              value(),
            );
            props.onClose("create");
          }}
        >
          Create
        </button>
      </Show>
    </div>
  );
}
