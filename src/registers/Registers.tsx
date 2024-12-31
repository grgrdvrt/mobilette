import { createSignal, Show, For, onMount, onCleanup } from "solid-js";
import { produce } from "solid-js/store";

import { Register, useStore } from "../store";
const [store, setStore] = useStore();

import { RegisterDetails } from "./RegistersDetails";
import { range } from "../utils";

export type RegisterPosition = { x: number; y: number };

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