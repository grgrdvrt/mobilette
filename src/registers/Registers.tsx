import { createSignal, Show, For, onMount, onCleanup } from "solid-js";
import { produce } from "solid-js/store";

import {
  getRegisterDefaultName,
  Registers as RegistersType,
  useStore,
} from "../store";
const [store, setStore] = useStore();

import { RegisterDetails } from "./RegistersDetails";
import { invertLightness, range } from "../utils";

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
  const registerColor = (x: number, y: number, defaultColor = "#eeeeee") => {
    return register(x, y)?.color ?? defaultColor;
  };
  const registerName = (x: number, y: number) => {
    const reg = register(x, y);
    if (!reg) {
      return;
    }
    return reg.name?.substring(0, 4) ?? getRegisterDefaultName(reg);
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
                      "background-color": registerColor(i, j),
                      color: invertLightness(registerColor(i, j)),
                    }}
                  >
                    {registerName(i, j)}
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
