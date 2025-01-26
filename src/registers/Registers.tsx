import { createSignal, Show, For, onMount, onCleanup } from "solid-js";
import { produce } from "solid-js/store";

import { Registers as RegistersType, useStore } from "../store";
const [store, setStore] = useStore();

import { RegisterDetails } from "./RegistersDetails";
import { range } from "../utils";

export type RegisterPosition = { x: number; y: number };

export function RegistersGrid(props: {
  registers: RegistersType;
  onRegisterClicked: (position: RegisterPosition) => void;
}) {
  let el: HTMLDivElement | undefined;
  const cols = range(0, 10);
  const rows = range(0, 40);
  const register = (x: number, y: number) => {
    return Object.values(props.registers).find((r) => r.x === x && r.y === y);
  };
  const registerColor = (x: number, y: number) => {
    return register(x, y)?.color;
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
                return (
                  <div
                    class="registerCell"
                    data-x={i}
                    data-y={j}
                    style={{
                      "background-color": (() =>
                        register(i, j)?.color ?? "#eeeeee")(),
                    }}
                  >
                    {register(i, j)?.name?.substring(0, 4)}
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

export function Registers(props: { registers: RegistersType }) {
  const [selectedRegister, setSelectedRegister] =
    createSignal<RegisterPosition | null>(null);
  return (
    <div class="registers">
      <RegistersGrid
        registers={props.registers}
        onRegisterClicked={(registerPosition: RegisterPosition) => {
          setSelectedRegister(registerPosition);
        }}
      />
      <Show when={selectedRegister() !== null}>
        <RegisterDetails
          registerPosition={selectedRegister()!}
          onClose={() => setSelectedRegister(null)}
        />
      </Show>
    </div>
  );
}
