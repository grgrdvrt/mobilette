import {
  createSignal,
  createMemo,
  Show,
  For,
  onMount,
  onCleanup,
} from "solid-js";
import { produce } from "solid-js/store";

import "./App.css";
import {
  createRegister,
  getRegisterByPosition,
  makeEmptyRegister,
  Register,
  saveRegister,
  useStore,
} from "./store";
const [store, setStore] = useStore();

import ClosePicto from "./assets/close_FILL0_wght400_GRAD0_opsz24.svg";

import { types, defaultValues } from "./language";

import { DataInput } from "./components/ValueInput";

type RegisterPosition = { x: number; y: number };

function range(min: number, max: number) {
  const result = [];
  for (let i = min; i < max; i++) {
    result.push(i);
  }
  return result;
}

export function RegistersGrid(props: {
  registers: Register[];
  onRegisterClicked: (position: RegisterPosition) => void;
}) {
  let el: HTMLDivElement | undefined;
  const cols = range(0, 10);
  const rows = range(0, 40);
  const register = (x: number, y: number) => {
    return props.registers.find((r) => r.x === x && r.y === y);
  };
  onMount(() => {
    if (el) {
      el.scrollTop = store.gui.registers.scrollTop;
      el.scrollLeft = store.gui.registers.scrollLeft;
    }
  });
  onCleanup(() => {
    setStore(
      produce((store) => {
        if (el) {
          store.gui.registers.scrollTop = el.scrollTop;
          store.gui.registers.scrollLeft = el.scrollLeft;
        }
      }),
    );
  });
  return (
    <div
      ref={el}
      class="registersGrid"
      onClick={(e: MouseEvent) => {
        const target = e.target as HTMLDivElement;
        const x = target.dataset.x;
        const y = target.dataset.y;
        if (x && y) {
          props.onRegisterClicked({
            x: Number(x),
            y: Number(y),
          });
        }
      }}
    >
      <For each={rows}>
        {(j) => {
          return (
            <For each={cols}>
              {(i) => {
                const reg = register(i, j);
                return (
                  <div
                    class="registerCell"
                    data-x={i}
                    data-y={j}
                    style={{
                      "background-color": reg?.color ?? "#eeeeee",
                    }}
                  >
                    {register(i, j)?.name?.substring(0, 3)}
                  </div>
                );
              }}
            </For>
          );
        }}
      </For>
    </div>
  );
}

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
    register().value ?? defaultValues[type()],
  );
  let colorField, nameField;
  return (
    <div class="registerDetails">
      <button onClick={() => props.onClose("close")}>
        <img src={ClosePicto} />
      </button>
      <p>
        {register().x}:{register().y}
      </p>

      <input ref={colorField} type="color" value={register().color} />

      <DataInput
        type={type}
        setType={setType}
        value={value}
        setValue={setValue}
      />

      <label for="registerName">name</label>
      <input ref={nameField} id="registerName" value={register().name ?? ""} />
      <br />

      <Show
        when={register().id === "empty"}
        fallback={
          <button
            onClick={() => {
              saveRegister(
                register().id,
                type(),
                colorField!.value,
                nameField!.value,
                value(),
              );
              props.onClose("save");
            }}
          >
            Save
          </button>
        }
      >
        <button onClick={() => props.onClose("cancel")}>Cancel</button>
        <button
          onClick={() => {
            createRegister(
              props.registerPosition.x,
              props.registerPosition.y,
              type(),
              colorField!.value,
              nameField!.value,
              value(),
            );
            props.onClose("create");
          }}
        >
          Create
        </button>
      </Show>
    </div>
  );
}

export function Registers(props: { registers: Register[] }) {
  const [selectedRegister, setSelectedRegisiter] =
    createSignal<RegisterPosition | null>(null);
  return (
    <div class="registers">
      <RegistersGrid
        registers={props.registers}
        onRegisterClicked={(registerPosition: RegisterPosition) => {
          setSelectedRegisiter(registerPosition);
        }}
      />
      <Show when={selectedRegister() !== null}>
        <RegisterDetails
          registerPosition={selectedRegister()!}
          onClose={() => setSelectedRegisiter(null)}
        />
      </Show>
    </div>
  );
}
