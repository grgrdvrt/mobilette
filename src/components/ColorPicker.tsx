import { createSignal } from "solid-js";
import { hslaToHslaString } from "../utils";
type HSLA = [number, number, number, number];
type HSVA = {
  h: number;
  s: number;
  v: number;
  a: number;
};

function hslaToHsva(hsla: HSLA): HSVA {
  const s = hsla[1] / 100;
  const l = hsla[2] / 100;

  const v = l + s * Math.min(l, 1 - l);
  const sNew = v === 0 ? 0 : 2 * (1 - l / v);

  return { h: hsla[0], s: sNew, v: v, a: hsla[3] };
}

function hsvaToHsla(hsva: HSVA): HSLA {
  const l = hsva.v * (1 - hsva.s / 2);
  const sNew = l === 0 || l === 1 ? 0 : (hsva.v - l) / Math.min(l, 1 - l);
  return [hsva.h, Math.round(100 * sNew), Math.round(100 * l), hsva.a];
}

const ColorPicker = (props: {
  hsla: HSLA;
  onChange: (color: HSLA) => void;
}) => {
  const [color, setColor] = createSignal(hslaToHsva(props.hsla));

  const updateSaturationLightness = (event: PointerEvent) => {
    event.preventDefault();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const s = Math.min(Math.max(0, x / rect.width), 1);
    const v = Math.min(Math.max(0, 1 - y / rect.height), 1);
    const newHsva: HSVA = { ...color(), s, v };
    setColor(newHsva);
    props.onChange(hsvaToHsla(newHsva)); // Call onChange prop with the current color
  };

  return (
    <div>
      <div
        style={{
          width: "200px",
          height: "200px",
          "background-image": `linear-gradient(to top, #000 0%, transparent 100%),
                linear-gradient(to right, #fff 0%, transparent 100%)`,
          "background-color": `hsl(${color().h}, 100%, 50%)`,
          position: "relative",
          cursor: "crosshair",
          border: "solid 1px black",
          "touch-action": "none",
        }}
        onPointerMove={updateSaturationLightness}
      >
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%)`,
            top: `${100 * (1 - color().v)}%`,
            left: `${100 * color().s}%`,
            width: "10px",
            height: "10px",
            background: "black",
            "border-radius": "50%",
            "pointer-events": "none",
          }}
        />
      </div>

      <div
        style={{
          background: `linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`,
          height: "20px",
          "border-radius": "10px",
          "margin-top": "10px",
        }}
      >
        <input
          type="range"
          min="0"
          max="360"
          value={color().h}
          onInput={(e) => {
            const newHsva: HSVA = {
              ...color(),
              h: Number(e.target.value),
            };
            setColor(newHsva);
            props.onChange(hsvaToHsla(newHsva));
          }}
          style={{
            width: "100%",
            appearance: "none",
            background: "transparent",
            position: "relative",
          }}
        />
      </div>
      <div
        style={{
          height: "20px",
          "border-radius": "10px",
          "background-image":
            "linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%)",
          "background-size": "20px 20px",
          "background-position": "0 0, 0 10px, 10px -10px, -10px 0px",
          overflow: "hidden",
          "margin-top": "10px",
        }}
      >
        <input
          type="range"
          min="0"
          step="0.01"
          max="1"
          value={color().a}
          onInput={(e) => {
            const newHsva: HSVA = {
              ...color(),
              a: Number(e.target.value),
            };
            setColor(newHsva);
            props.onChange(hsvaToHsla(newHsva));
          }}
          style={{
            width: "100%",
            height: "100%",

            "background-image": `linear-gradient(to right, transparent 0%, ${hslaToHslaString(hsvaToHsla(color()))} 100%)`,
            appearance: "none",
            background: "transparent",
            position: "relative",
            margin: 0,
          }}
        />
      </div>
      <div
        style={{
          width: "50px",
          height: "50px",
          "background-image":
            "linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%)",
          "background-size": "20px 20px",
          "background-position": "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            "margin-top": "10px",
            "background-color": (() => hslaToHslaString(hsvaToHsla(color())))(),
          }}
        ></div>
      </div>
    </div>
  );
};

export default ColorPicker;
