import { createSignal, Setter } from "solid-js";

import { setParameter, getSlot, InstructionPath } from "../store";

import { types, defaultValues } from "../language/language";

import { DataInput } from "../components/DataInput";

export function ValueInput(props: {
  instructionPath: InstructionPath;
  slotIndex: number;
  setSelectedInput: Setter<any>;
}) {
  const slot = () => {
    return getSlot(props.instructionPath, props.slotIndex);
  };

  const [type, setType] = createSignal(slot()?.content.type ?? types.NUMBER);
  const [value, setValue] = createSignal(
    slot()?.type === "value"
      ? (slot()?.content.value ?? defaultValues[type()])
      : defaultValues[type()],
  );

  return (
    <div class="valueInput">
      <DataInput
        type={type}
        setType={setType}
        value={value}
        setValue={setValue}
      />
      <button
        onClick={() => {
          setParameter(
            { ...props.instructionPath, slotIndex: props.slotIndex },
            "value",
            {
              type: type(),
              value: value(),
            },
          );
          props.setSelectedInput(null);
        }}
      >
        set
      </button>
    </div>
  );
}
