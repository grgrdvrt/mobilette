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
  setSelection,
  addParameter,
  removeParameter,
  Program,
  Instruction,
  Register,
  ProgramContextId,
} from "../store";

import { types, instructionsDefinitions } from "../language/language";

import { hslaToHslaString } from "../utils";

function EmptySlot(props: {
  setSelectedInput: Setter<{
    sourcePath: ProgramContextId;
    lineId: Instruction["id"];
    value: any;
    index: number;
  }>;
  sourcePath: ProgramContextId;
  line: Instruction;
  index: number;
}) {
  return (
    <button
      class="codeRegister"
      style={{}}
      onClick={(e) => {
        e.stopPropagation();
        props.setSelectedInput({
          sourcePath: props.sourcePath,
          lineId: props.line.id,
          value: null,
          index: props.index,
        });
      }}
    >
      {"slot"}
    </button>
  );
}

function RegisterParam(props: {
  registers: Register[];
  registerId: Register["id"];
  setSelectedInput: Setter<any>;
  sourcePath: ProgramContextId;
  line: Instruction;
  index: number;
}) {
  const register = createMemo(() => {
    const register = props.registers.find((r) => r.id === props.registerId);
    if (!register) {
      throw new Error("Register not found");
    }
    return register;
  });
  return (
    <button
      class="codeRegister"
      style={{ "background-color": register().color }}
      onClick={(e) => {
        e.stopPropagation();
        props.setSelectedInput({
          sourcePath: props.sourcePath,
          lineId: props.line.id,
          value: register(),
          index: props.index,
        });
      }}
    >
      {register().name || register().y + ":" + register().x}
    </button>
  );
}

function ValueParam(props: {
  valueInput: any;
  setSelectedInput: Setter<any>;
  sourcePath: ProgramContextId;
  line: Instruction;
  index: number;
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
        props.setSelectedInput({
          sourcePath: props.sourcePath,
          lineId: props.line.id,
          value: props.valueInput,
          index: props.index,
        });
      }}
    >
      {JSON.stringify(props.valueInput.value)}
    </button>
  );
}

export function SourceLine(props: {
  line: Instruction;
  depth: Accessor<number>;
  selected: Accessor<boolean>;
  sourcePath: ProgramContextId;
  registers: Register[];
  setSelectedInput: Setter<any>;
  order: string;
}) {
  const canAddParam = (line: Instruction) => {
    if (!line.code.length) return false;

    const [module, command] = line.code;
    if (module === "" || command === "") {
      return false;
    }
    const def = instructionsDefinitions[module][command];
    return def.some((d) => d.params[d.params.length - 1]?.variadic);
  };
  const canRemoveParam = (line: Instruction) => {
    if (!line.code.length) return false;
    const [module, command] = line.code;
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
    const canRemove = line.code.length > minLength;
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
          props.selected() ? setSelection([]) : setSelection([props.line.id])
        }
      >
        <Show
          when={
            props.line.code.length &&
            props.line.code[0] !== "" &&
            props.line.code[1] !== ""
          }
          fallback={<p>//</p>}
        >
          {props.line.code[1]}
          <span> </span>
          <For each={props.line.code.slice(2)}>
            {(input, index) => {
              return (
                <>
                  <Switch>
                    <Match when={input.type === "empty"}>
                      <Show when={props.selected()}>
                        <EmptySlot
                          setSelectedInput={props.setSelectedInput}
                          sourcePath={props.sourcePath}
                          line={props.line}
                          index={index()}
                        />
                      </Show>
                    </Match>
                    <Match when={input.type === "value"}>
                      <ValueParam
                        valueInput={input.value}
                        setSelectedInput={props.setSelectedInput}
                        sourcePath={props.sourcePath}
                        line={props.line}
                        index={index()}
                      />
                    </Match>
                    <Match when={input.type === "register"}>
                      <RegisterParam
                        registerId={input.value}
                        registers={props.registers}
                        setSelectedInput={props.setSelectedInput}
                        sourcePath={props.sourcePath}
                        line={props.line}
                        index={index()}
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
                  addParameter(props.sourcePath, props.line.id);
                }}
              >
                +
              </button>
            </Show>
            <Show when={(() => canRemoveParam(props.line))()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeParameter(props.sourcePath, props.line.id);
                }}
              >
                -
              </button>
            </Show>
          </Show>
        </Show>
      </p>
    </div>
  );
}
