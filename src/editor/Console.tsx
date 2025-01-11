import { Accessor, createEffect, on, For } from "solid-js";
export function ProgramConsole(props: { log: Accessor<any> }) {
  let container: HTMLDivElement | undefined;
  createEffect(
    on(props.log, () => {
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }),
  );
  return (
    <div ref={container} style={{ height: "100%", overflow: "auto" }}>
      <For each={props.log().slice(-200)}>{(line) => <p>{line}</p>}</For>
    </div>
  );
}
