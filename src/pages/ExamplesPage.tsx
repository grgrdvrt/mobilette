import { createSignal, createSelector, For, Setter } from "solid-js";

// import RegistersPicto from "./assets/grid_view_FILL0_wght400_GRAD0_opsz24.svg";

import ForkPicto from "../assets/arrow_split_FILL0_wght400_GRAD0_opsz24.svg";
import PlayPicto from "../assets/play_circle_FILL0_wght400_GRAD0_opsz24.svg";

import { fork, Program, setProgram } from "../store";

import program1 from "../assets/examples/mobilette_program.json";
import program2 from "../assets/examples/mobilette_program(1).json";
import program3 from "../assets/examples/mobilette_program(2).json";
import program4 from "../assets/examples/mobilette_program(3).json";
import program5 from "../assets/examples/mobilette_program(4).json";
const documents = [program1, program2, program3, program4, program5].map((p) =>
  Object.assign(p, { isExample: true }),
) as Program[];

export function ExamplesPage(props: { setPage: Setter<string> }) {
  const [selected, setSelected] = createSignal<string | null>(null);
  const isSelected = createSelector(selected);
  return (
    <div class="examples" onClick={() => setSelected(null)}>
      <div
        class="examples-title"
        onClick={() => {
          props.setPage("home");
        }}
      >
        <h1 class="mainTitle">Mobilette</h1>
        <h2 class="subtitle">.computer</h2>
      </div>
      <p></p>
      <ol class="documentsList">
        <For each={documents}>
          {(program) => {
            return (
              <li
                class="documentItem"
                classList={{ selected: isSelected(program.id) }}
              >
                <div
                  class="documentItem-thumb"
                  style={{
                    "background-image": `url(${program.thumb ?? "data:image/png;base64,"})`,
                  }}
                  onClick={(e) => {
                    e.stopImmediatePropagation();
                    setSelected(program.id);
                  }}
                />
                <div class="documentItem-overlay">
                  <button
                    onClick={() => {
                      setProgram(JSON.parse(JSON.stringify(program)));
                      props.setPage("editor");
                    }}
                  >
                    {" "}
                    <img style={{ height: "3.5em" }} src={PlayPicto} />
                  </button>
                  <div class="documentItem-actions">
                    <button
                      onClick={() => {
                        fork(program);
                        props.setPage("home");
                      }}
                    >
                      <img
                        style={{ "vertical-align": "middle" }}
                        src={ForkPicto}
                      />
                    </button>
                  </div>
                </div>
              </li>
            );
          }}
        </For>
      </ol>
    </div>
  );
}
