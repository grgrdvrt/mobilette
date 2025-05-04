import { createSignal } from "solid-js";

const ColorPicker = (props: {
  hsla: [number, number, number, number];
  onChange: (color: string) => void;
}) => {
  const [color, setColor] = createSignal({
    hue: props.hsla[0] || 0,
    saturation: props.hsla[1] || 100,
    lightness: props.hsla[2] || 50,
    opacity: props.hsla[3] || 100,
  });

  const hslaColor = () =>
    `hsla(${color().hue}, ${color().saturation}%, ${color().lightness}%, ${color().opacity / 100})`;

  const updateSaturationLightness = (event: PointerEvent) => {
    event.preventDefault();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const sat = Math.min(Math.max(0, (x / rect.width) * 100), 100);
    const lig = Math.min(Math.max(0, 100 - (y / rect.height) * 100), 100);
    setColor((prev) => ({ ...prev, saturation: sat, lightness: lig }));
    props.onChange(hslaColor()); // Call onChange prop with the current color
  };

  return (
    <div>
      <div
        style={{
          width: "200px",
          height: "200px",
          "background-image": `linear-gradient(to top, #000 0%, transparent 100%),
                linear-gradient(to right, #fff 0%, transparent 100%)`,
          "background-color": `hsl(${color().hue}, 100%, 50%)`,
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
            top: `${100 - color().lightness}%`,
            left: `${color().saturation}%`,
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
          height: "10px",
          "border-radius": "5px",
          "margin-top": "10px",
        }}
      >
        <input
          type="range"
          min="0"
          max="360"
          value={color().hue}
          onInput={(e) => {
            setColor((prev) => ({ ...prev, hue: Number(e.target.value) }));
            props.onChange(hslaColor());
          }}
          style={{
            width: "100%",
            appearance: "none",
            background: "transparent",
            position: "relative",
            top: "-5px",
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        step="0.01"
        max="1"
        value={color().opacity}
        onInput={(e) => {
          setColor((prev) => ({ ...prev, opacity: Number(e.target.value) }));
          props.onChange(hslaColor());
        }}
      />
    </div>
  );
};

export default ColorPicker;
