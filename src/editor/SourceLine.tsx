import {
  Show,
  For,
  Switch,
  Match,
  createMemo,
  Setter,
  Accessor,
} from "solid-js";

import {
  addSlot,
  removeSlot,
  Instruction,
  Register,
  InstructionPath,
  clearCursor,
  setCursor,
  SlotPath,
  Registers,
  getRegisterDefaultName,
  ParamSlot,
} from "../store";

import {
  types,
  instructionsDefinitions,
  ParamInput,
} from "../language/language";

import { hslaToHslaString, invertLightness } from "../utils";

function EmptySlot(props: {
  slotPath: SlotPath;
  setSelectedSlot: Setter<SlotPath | null>;
  instruction: Instruction;
}) {
  return (
    <button
      class="codeRegister"
      style={{}}
      onClick={(e) => {
        e.stopPropagation();
        props.setSelectedSlot(props.slotPath);
      }}
    >
      {"slot"}
    </button>
  );
}

function RegisterParam(props: {
  slotPath: SlotPath;
  registers: Registers;
  registerId: Register["id"];
  setSelectedSlot: Setter<any>;
}) {
  const register = createMemo(() => {
    const register = props.registers[props.registerId];
    if (!register) {
      throw new Error("Register not found");
    }
    return register;
  });
  return (
    <button
      class="codeRegister"
      style={{
        "background-color": register().color,
        color: invertLightness(register().color),
      }}
      onClick={(e) => {
        e.stopPropagation();
        props.setSelectedSlot(props.slotPath);
      }}
    >
      {register().name || getRegisterDefaultName(register())}
    </button>
  );
}

function ValueParam(props: {
  slotPath: SlotPath;
  valueInput: any;
  setSelectedSlot: Setter<SlotPath | null>;
}) {
  return (
    <button
      class="codeRegister"
      style={{
        border: "solid 1px black",
        "background-color":
          props.valueInput.type === types.COLOR
            ? hslaToHslaString(props.valueInput.value)
            : "white",
        color:
          props.valueInput.type === types.COLOR &&
          props.valueInput.value[2] < 50
            ? "white"
            : "black",
      }}
      onClick={(e) => {
        e.stopPropagation();
        props.setSelectedSlot(props.slotPath);
      }}
    >
      {props.valueInput.type === types.BOOLEAN
        ? props.valueInput.value
          ? "True"
          : "False"
        : JSON.stringify(props.valueInput.value)}
    </button>
  );
}

export function EmptySourceLine(props: {
  instructionPath: InstructionPath;
  selected: Accessor<boolean>;
  order: string;
}) {
  return (
    <div
      class="sourceLine"
      classList={{ selected: props.selected() }}
      style={{ order: props.order }}
    >
      <p
        onClick={() =>
          props.selected()
            ? clearCursor()
            : setCursor(
                props.instructionPath.programContextId,
                props.instructionPath.lineIndex,
              )
        }
      >
        //
      </p>
    </div>
  );
}

export function SourceLine(props: {
  instructionPath: InstructionPath;
  line: Instruction;
  depth: Accessor<number>;
  selected: Accessor<boolean>;
  registers: Registers;
  setSelectedSlot: Setter<SlotPath | null>;
  order: string;
}) {
  const canAddParam = (line: Instruction) => {
    const [module, command] = line;
    const def = instructionsDefinitions[module][command];
    return def.some((d) => d.params[d.params.length - 1]?.variadic);
  };

  const canRemoveParam = (line: Instruction) => {
    if (!line.length) return false;
    const [module, command] = line;
    if (module === "" || command === "") {
      return false;
    }
    const def = instructionsDefinitions[module][command];
    // a function is variadic if at least one of its implementations is variadic
    const isVariadic = def.some((d) => d.params[d.params.length - 1]?.variadic);
    const minLength = def.reduce(
      (m, d) => Math.min(m, d.params.length),
      Number.MAX_SAFE_INTEGER,
    );
    const canRemove = line?.length > minLength;
    return isVariadic && canRemove;
  };

  return (
    <div
      class="sourceLine"
      classList={{ selected: props.selected() }}
      style={{ order: props.order }}
    >
      <p
        style={{ "padding-left": 15 * props.depth() + "px" }}
        onClick={() =>
          props.selected()
            ? clearCursor()
            : setCursor(
                props.instructionPath.programContextId,
                props.instructionPath.lineIndex,
              )
        }
      >
        {props.line![1]}
        <span> </span>
        <For each={props.line.slice(2) as ParamSlot[]}>
          {(input, index) => {
            if (input === null) {
              return (
                <Show when={props.selected()}>
                  <EmptySlot
                    slotPath={{
                      ...props.instructionPath,
                      slotIndex: index(),
                    }}
                    setSelectedSlot={props.setSelectedSlot}
                    instruction={props.line}
                  />
                </Show>
              );
            }
            return (
              <>
                <Switch>
                  <Match when={input.type === "value"}>
                    <ValueParam
                      slotPath={{
                        ...props.instructionPath,
                        slotIndex: index(),
                      }}
                      valueInput={input.content}
                      setSelectedSlot={props.setSelectedSlot}
                    />
                  </Match>
                  <Match when={input.type === "register"}>
                    <RegisterParam
                      slotPath={{
                        ...props.instructionPath,
                        slotIndex: index(),
                      }}
                      registerId={input.content}
                      registers={props.registers}
                      setSelectedSlot={props.setSelectedSlot}
                    />
                  </Match>
                </Switch>
                <span> </span>
              </>
            );
          }}
        </For>
        <Show when={props.selected()}>
          <Show when={(() => canAddParam(props.line))()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addSlot(props.instructionPath);
              }}
            >
              +
            </button>
          </Show>
          <Show when={(() => canRemoveParam(props.line))()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSlot(props.instructionPath);
              }}
            >
              -
            </button>
          </Show>
        </Show>
      </p>
    </div>
  );
}
