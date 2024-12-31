import { createSignal, Setter } from "solid-js";

import { setParameter, getSlot } from "../store";

import { types, defaultValues } from "../language/language";

import { DataInput } from "../components/DataInput";

export function ValueInput(props: {
  selectedInput: any;
  setSelectedInput: Setter<any>;
}) {
  const input = () => {
    return getSlot(
      props.selectedInput.sourcePath,
      props.selectedInput.lineId,
      props.selectedInput.index,
    );
  };

  const [type, setType] = createSignal(input().value.type ?? types.NUMBER);
  const [value, setValue] = createSignal(
    input()?.type === "value"
      ? (input().value.value ?? defaultValues[type()])
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
          const { sourcePath, lineId, index } = props.selectedInput;
          setParameter(sourcePath, lineId, index, "value", {
            type: type(),
            value: value(),
          });
          props.setSelectedInput(null);
        }}
      >
        set
      </button>
    </div>
  );
}
