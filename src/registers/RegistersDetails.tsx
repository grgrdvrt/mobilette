import { createSignal, createMemo, Show } from "solid-js";

import {
  createRegister,
  deleteRegister,
  getRegisterByPosition,
  getRegisterDefaultName,
  isRegisterUsed,
  makeEmptyRegister,
  saveRegister,
} from "../store";

import ClosePicto from "../assets/close_FILL0_wght400_GRAD0_opsz24.svg";
import DeletePicto from "../assets/delete_FILL0_wght400_GRAD0_opsz24.svg";

import { types, defaultValues } from "../language/language";

import { ExpandedDataInput } from "../components/ExpandedDataInput";
import ColorPickerPopover from "../components/ColorPickerPopover";
import { hexToHSLA, hslaToHex, invertLightness } from "../utils";

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
  const [color, setColor] = createSignal(register().color);
  let nameField: HTMLInputElement;

  const update = () => {
    saveRegister(
      register().id,
      type(),
      color(),
      nameField!.value,
      value(),
    );
  };
  return (
    <div class="registerDetails">
      <div class="registerDetails-header">
        <button onClick={() => props.onClose("close")}>
          <img src={ClosePicto} />
        </button>
        <input
          ref={nameField!}
          class="registerDetails-name"
          onFocus={() => nameField.select()}
          value={register().name || getRegisterDefaultName(register())}
          style={{
            "background-color": color(),
            color: invertLightness(color()),
          }}
        />
        <ColorPickerPopover
          hsla={hexToHSLA(color(), 1)}
          onChange={(hsla) => {
            setColor(hslaToHex(hsla[0], hsla[1], hsla[2]));
            update();
          }}
        />
      </div>
      <ExpandedDataInput
        type={type}
        setType={setType}
        value={value}
        setValue={setValue}
      />
      <Show
        when={register().id === "empty"}
        fallback={
          <div class="registerDetails-validate">
            <Show when={!isRegisterUsed(register())} fallback={<div></div>}>
              <button
                onClick={() => {
                  deleteRegister(register().id);
                  props.onClose("cancel");
                }}
              >
                <img src={DeletePicto} />
              </button>
            </Show>
            <button
              onClick={() => {
                update();
                props.onClose("save");
              }}
            >
              Save
            </button>
          </div>
        }
      >
        <div class="registerDetails-validate">
          <button onClick={() => props.onClose("cancel")}>Cancel</button>
          <button
            onClick={() => {
              createRegister(
                props.registerPosition.x,
                props.registerPosition.y,
                type(),
                color(),
                nameField!.value,
                value(),
              );
              props.onClose("create");
            }}
          >
            Create
          </button>
        </div>
      </Show>
    </div>
  );
}
