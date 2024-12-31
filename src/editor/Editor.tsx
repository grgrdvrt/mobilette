import { Show, For, createSignal, createMemo, Setter } from "solid-js";

import {
  useStore,
  insertAfter,
  getSelectedLines,
  deleteSelection,
  clickContext,
  Program,
  Instruction,
  Register,
  ProgramContextId,
} from "../store";
const [store] = useStore();

import { InstructionsMenu } from "./InstructionsMenu";
import { InputSelection } from "./InputSelection";
import { SourceLine } from "./SourceLine";

function ProgramInterface(props: {
  source: Instruction[];
  sourcePath: ProgramContextId;
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
          store.gui.cursor.programContextId === props.sourcePath &&
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
                  store.gui.cursor.programContextId === props.sourcePath &&
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

export function Editor(props: {
  source: Program["source"];
  registers: Register[];
}) {
  const [selectedInput, setSelectedInput] = createSignal(null);
  const showInstruction = () => {
    const selectedLines = getSelectedLines();
    console.log(
      selectedLines.length === 1 &&
        (selectedLines[0].code.length === 0 ||
          selectedLines[0]?.code[0] === "" ||
          selectedLines[0]?.code[1] === ""),
    );
    return (
      selectedLines.length === 1 &&
      (selectedLines[0].code.length === 0 ||
        selectedLines[0].code[0] === "" ||
        selectedLines[0].code[1] === "")
    );
  };
  const hasSelection = () => {
    return store.gui.selection.length > 0;
  };

  function CodeContext(ctxProps: { title: string; key: ProgramContextId }) {
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
