import { Show, createSignal, Setter } from "solid-js";

import {
  getRegisterByPosition,
  setParameter,
  InstructionPath,
  SlotPath,
  Registers,
} from "../store";

import { RegistersGrid } from "../registers/Registers";
import {
  RegisterDetailsCloseReasons,
  RegisterDetails,
} from "../registers/RegistersDetails";
import { ValueInput } from "./ValueInput";

export function InputSelection(props: {
  slotPath: SlotPath;
  registers: Registers;
  instructionPath: InstructionPath;
  setSelectedSlot: Setter<SlotPath | undefined>;
}) {
  const [step, setStep] = createSignal<{ id: string; data: any }>({
    id: "selection",
    data: {},
  });

  return (
    <div class="inputSelection">
      <ValueInput
        instructionPath={props.instructionPath}
        slotIndex={props.slotPath.slotIndex}
        setSelectedInput={props.setSelectedSlot}
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
                setParameter(props.slotPath, "register", register.id);
                props.setSelectedSlot(undefined);
              }
            }}
          />
        </Show>
        <Show when={step().id == "creation"}>
          <RegisterDetails
            registerPosition={step().data}
            onClose={(reason: RegisterDetailsCloseReasons) => {
              if (reason === "create") {
                const register = getRegisterByPosition(
                  step().data.x,
                  step().data.y,
                );
                if (register) {
                  setParameter(props.slotPath, "register", register.id);
                }
              }
              props.setSelectedSlot(undefined);
            }}
          />
        </Show>
      </div>
    </div>
  );
}
