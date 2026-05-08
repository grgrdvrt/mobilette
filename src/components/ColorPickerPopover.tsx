import { createSignal, Show } from "solid-js";
import ColorPicker from "./ColorPicker";
import { hslaToHslaString } from "../utils";

type HSLA = [number, number, number, number];

export function ColorPickerPopover(props: {
  hsla: HSLA;
  onChange: (color: HSLA) => void;
}) {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <button
        type="button"
        class="colorPickerPopover-preview"
        onClick={() => setIsOpen(true)}
        aria-label="Pick color"
      >
        <span
          class="colorPickerPopover-swatch"
          style={{ "background-color": hslaToHslaString(props.hsla) }}
        />
      </button>
      <Show when={isOpen()}>
        <div
          class="colorPickerPopover-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div
            class="colorPickerPopover-content"
            onClick={(e) => e.stopPropagation()}
          >
            <ColorPicker hsla={props.hsla} onChange={props.onChange} />
          </div>
        </div>
      </Show>
    </>
  );
}

export default ColorPickerPopover;
