import { Show, For, createSignal, createMemo, Setter } from "solid-js";

import {
  useStore,
  insertAfter,
  deleteLine,
  clickContext,
  Program,
  ProgramContextType,
  ProgramContext,
  hasSelection,
  SlotPath,
  Registers,
} from "../store";
const [store] = useStore();

import { InstructionsMenu } from "./InstructionsMenu";
import { InputSelection } from "./InputSelection";
import { EmptySourceLine, SourceLine } from "./SourceLine";

function ProgramInterface(props: {
  source: ProgramContext;
  sourcePath: ProgramContextType;
  registers: Registers;
  setSelectedSlot: Setter<SlotPath | null>;
}) {
  const isSelected = (instructionIndex: number) => {
    const cursor = store.gui.cursor;
    const isSelected =
      cursor !== null &&
      cursor.programContextId === props.sourcePath &&
      cursor.lineIndex === instructionIndex;
    return isSelected;
  };

  const depths = createMemo(() => {
    let d = 0;
    return props.source.map((line) => {
      if (line == null) {
        return d;
      }
      let result;
      if (line[1] === "endif" || line[1] === "endfor") {
        return --d;
      }
      if (line[1] === "else" || line[1] === "elseif") {
        return d - 1;
      }
      result = d;
      if (line[1] === "if" || line[1] === "for") {
        d++;
      }
      return result;
    });
  });

  return (
    <div style={{ display: "flex", "flex-direction": "column" }}>
      <Show
        when={
          store.gui.cursor &&
          store.gui.cursor.programContextId === props.sourcePath &&
          store.gui.cursor.lineIndex === -1
        }
      >
        <button
          class="insertionButton"
          onClick={() => insertAfter(props.sourcePath, -1)}
        >
          +
        </button>
      </Show>
      <For each={props.source}>
        {(line, i) => {
          return (
            <>
              <Show
                when={line != null}
                fallback={
                  <EmptySourceLine
                    instructionPath={{
                      programContextId: props.sourcePath,
                      lineIndex: i(),
                    }}
                    selected={() => isSelected(i())}
                    order="0"
                  />
                }
              >
                <SourceLine
                  instructionPath={{
                    programContextId: props.sourcePath,
                    lineIndex: i(),
                  }}
                  line={line!}
                  depth={() => depths()[i()]}
                  registers={props.registers}
                  selected={() => isSelected(i())}
                  setSelectedSlot={props.setSelectedSlot}
                  order="0"
                />
              </Show>
              <Show
                when={
                  store.gui.cursor &&
                  store.gui.cursor.programContextId === props.sourcePath &&
                  store.gui.cursor.lineIndex === i()
                }
              >
                <button
                  class="insertionButton"
                  onClick={() => insertAfter(props.sourcePath, i())}
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
  registers: Registers;
}) {
  const [selectedSlot, setSelectedSlot] = createSignal<SlotPath | null>(null);
  const showInstructionSelection = () => {
    const cursor = store.gui.cursor;
    return (
      cursor &&
      cursor.lineIndex != -1 &&
      props.source[cursor.programContextId][cursor.lineIndex] === null
    );
  };

  function CodeContext(ctxProps: { title: string; key: ProgramContextType }) {
    return (
      <>
        <h3 onClick={() => clickContext(ctxProps.key)}>{ctxProps.title}</h3>
        <ProgramInterface
          source={props.source[ctxProps.key]}
          sourcePath={ctxProps.key}
          registers={props.registers}
          setSelectedSlot={setSelectedSlot}
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
      <Show when={showInstructionSelection()}>
        <InstructionsMenu />
      </Show>
      <Show when={hasSelection()}>
        <button
          class="codeDeleteBtn"
          onClick={() => deleteLine(store.gui.cursor!)}
        >
          Delete
        </button>
      </Show>
      <Show when={selectedSlot()}>
        <InputSelection
          slotPath={selectedSlot()!}
          registers={props.registers}
          instructionPath={store.gui.cursor!}
          setSelectedSlot={setSelectedSlot}
        />
      </Show>
    </div>
  );
}
