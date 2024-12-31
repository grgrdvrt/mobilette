import { Show, createSignal, Setter } from "solid-js";

import { getRegisterByPosition, setParameter, Register } from "../store";

import { RegistersGrid } from "../registers/Registers";
import {
  RegisterDetailsCloseReasons,
  RegisterDetails,
} from "../registers/RegistersDetails";
import { ValueInput } from "./ValueInput";

export function InputSelection(props: {
  registers: Register[];
  selectedInput: any;
  setSelectedInput: Setter<any>;
}) {
  const [step, setStep] = createSignal<{ id: string; data: any }>({
    id: "selection",
    data: {},
  });

  return (
    <div class="inputSelection">
      <ValueInput
        selectedInput={props.selectedInput}
        setSelectedInput={props.setSelectedInput}
      />
      <div class="registerPicker">
        <Show when={step().id == "selection"}>
          <RegistersGrid
            registers={props.registers}
            onRegisterClicked={(registerPosition: { x: number; y: number }) => {
              const register = getRegisterByPosition(
                registerPosition.x,
                registerPosition.y,
              );
              if (!register) {
                setStep({ id: "creation", data: registerPosition });
              } else {
                const { sourcePath, lineId, index } = props.selectedInput;
                setParameter(
                  sourcePath,
                  lineId,
                  index,
                  "register",
                  register.id,
                );
                props.setSelectedInput(null);
              }
            }}
          />
        </Show>
        <Show when={step().id == "creation"}>
          <RegisterDetails
            registerPosition={step().data}
            onClose={(reason: RegisterDetailsCloseReasons) => {
              const { sourcePath, lineId, index } = props.selectedInput;
              if (reason === "create") {
                const register = getRegisterByPosition(
                  step().data.x,
                  step().data.y,
                );
                if (register) {
                  setParameter(
                    sourcePath,
                    lineId,
                    index,
                    "register",
                    register.id,
                  );
                }
              }
              props.setSelectedInput(null);
            }}
          />
        </Show>
      </div>
    </div>
  );
}
