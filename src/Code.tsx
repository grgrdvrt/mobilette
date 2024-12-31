import {
  Show,
  For,
  Switch,
  Match,
  createSignal,
  createMemo,
  Setter,
  Accessor,
} from "solid-js";

import {
  useStore,
  insertAfter,
  setSelection,
  getSelectedLines,
  deleteSelection,
  getRegisterByPosition,
  setParameter,
  addParameter,
  removeParameter,
  clickContext,
  getInput,
  Program,
  Instruction,
  Register,
} from "./store";
const [store] = useStore();

import { types, defaultValues, instructionsDefinitions } from "./language";

import { hslaToHslaString } from "./utils";

import { RegisterDetails, RegistersGrid } from "./Registers";
import { InstructionsMenu } from "./InstructionsMenu";

import { DataInput } from "./components/ValueInput";

function EmptySlot(props: {
  setSelectedInput: Setter<{
    sourcePath: keyof Program["source"];
    lineId: Instruction["id"];
    value: any;
    index: number;
  }>;
  sourcePath: keyof Program["source"];
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
  sourcePath: keyof Program["source"];
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
  sourcePath: keyof Program["source"];
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

function SourceLine(props: {
  line: Instruction;
  depth: Accessor<number>;
  selected: Accessor<boolean>;
  sourcePath: keyof Program["source"];
  registers: Register[];
  setSelectedInput: Setter<any>;
  order: string;
}) {
  const canAddParam = (line: Instruction) => {
    if (!line.code.length) return false;

    const [module, command] = line.code;
    const def = instructionsDefinitions[module][command];
    return def.some((d) => d.params[d.params.length - 1]?.variadic);
  };
  const canRemoveParam = (line: Instruction) => {
    if (!line.code.length) return false;
    const def = instructionsDefinitions[line.code[0]][line.code[1]];
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
        <Show when={props.line.code.length} fallback={<p>//</p>}>
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

function ProgramInterface(props: {
  source: Instruction[];
  sourcePath: keyof Program["source"];
  registers: Register[];
  setSelectedInput: Setter<any>;
}) {
  const isSelected = (id: string) => {
    const isSelected = store.gui.selection.indexOf(id) !== -1;
    return isSelected;
  };
  const depths = createMemo(() => {
    let d = 0;
    return props.source.map((line) => {
      let result;
      if (line.code[1] === "endif" || line.code[1] === "endfor") {
        d--;
      }
      result = d;
      if (line.code[1] === "if" || line.code[1] === "for") {
        d++;
      }
      return result;
    });
  });
  return (
    <div style={{ display: "flex", "flex-direction": "column" }}>
      <Show
        when={
          store.gui.cursor.context === props.sourcePath &&
          store.gui.cursor.position === -1
        }
      >
        <button
          class="insertionButton"
          onClick={() => insertAfter(props.sourcePath, null)}
        >
          +
        </button>
      </Show>
      <For each={props.source}>
        {(line, i) => {
          return (
            <>
              <SourceLine
                line={line}
                depth={() => depths()[i()]}
                sourcePath={props.sourcePath}
                registers={props.registers}
                selected={() => isSelected(line.id)}
                setSelectedInput={props.setSelectedInput}
                order="0"
              />
              <Show
                when={
                  store.gui.cursor.context === props.sourcePath &&
                  store.gui.cursor.position === i()
                }
              >
                <button
                  class="insertionButton"
                  onClick={() => insertAfter(props.sourcePath, line.id)}
                >
                  +
                </button>
              </Show>
            </>
          );
        }}
      </For>
    </div>
  );
}
export function Code(props: {
  source: Program["source"];
  registers: Register[];
}) {
  const [selectedInput, setSelectedInput] = createSignal(null);
  const showInstruction = () => {
    const selectedLines = getSelectedLines();
    return selectedLines.length === 1 && selectedLines[0].code.length === 0;
  };
  const hasSelection = () => {
    return store.gui.selection.length > 0;
  };

  function CodeContext(ctxProps: {
    title: string;
    key: keyof Program["source"];
  }) {
    return (
      <>
        <h3 onClick={() => clickContext(ctxProps.key)}>{ctxProps.title}</h3>
        <ProgramInterface
          source={props.source[ctxProps.key]}
          sourcePath={ctxProps.key}
          registers={props.registers}
          setSelectedInput={setSelectedInput}
        />
      </>
    );
  }
  return (
    <div class="code">
      <div class="codeList">
        <CodeContext title="Init" key="init" />
        <hr />
        <CodeContext title="Loop" key="loop" />
        <hr />
        <CodeContext title="On Pointer Down" key="pointerDown" />
        <hr />
        <CodeContext title="On Pointer Up" key="pointerUp" />
        <hr />
        <CodeContext title="On Pointer Move" key="pointerMove" />
      </div>
      <Show when={showInstruction()}>
        <InstructionsMenu />
      </Show>
      <Show when={hasSelection()}>
        <button class="codeDeleteBtn" onClick={deleteSelection}>
          Delete
        </button>
      </Show>
      <Show when={selectedInput()}>
        <InputSelection
          registers={props.registers}
          selectedInput={selectedInput()}
          setSelectedInput={setSelectedInput}
        />
      </Show>
    </div>
  );
}

export function ValueInput(props: {
  selectedInput: any;
  setSelectedInput: Setter<any>;
}) {
  const input = () => {
    return getInput(
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

function InputSelection(props: {
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
            onClose={(reason) => {
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
