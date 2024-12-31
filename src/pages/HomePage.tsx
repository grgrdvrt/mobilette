import {
  createSignal,
  createSelector,
  createResource,
  For,
  Setter,
} from "solid-js";

// import RegistersPicto from "./assets/grid_view_FILL0_wght400_GRAD0_opsz24.svg";
//
import Logo from "../assets/logo2.webp";
import Title from "../assets/title.png";

import DeletePicto from "../assets/delete_FILL0_wght400_GRAD0_opsz24.svg";
import ForkPicto from "../assets/arrow_split_FILL0_wght400_GRAD0_opsz24.svg";
import PlayPicto from "../assets/play_circle_FILL0_wght400_GRAD0_opsz24.svg";

import { createEmptyProgram, setProgram } from "../store";

import { saveDocument, getDocuments, deleteDocument } from "../db";

export function HomePage(props: { setPage: Setter<string> }) {
  const [documents, { refetch }] = createResource(getDocuments);
  const [selected, setSelected] = createSignal<string | null>(null);
  const isSelected = createSelector(selected);
  return (
    <div class="home" onClick={() => setSelected(null)}>
      <h1 class="title">
        <img class="home-logo" src={Logo} />
        <img class="home-title" src={Title} />
      </h1>
      <div class="home-actions">
        <button
          class="home-action"
          onClick={() => {
            props.setPage("about");
          }}
        >
          About
        </button>
        <button
          class="home-action"
          onClick={() => {
            const program = createEmptyProgram();
            saveDocument(program);
            setProgram(program);
            props.setPage("editor");
          }}
        >
          new
        </button>
        {/* <button class="home-action" onClick={() => {
                 deleteDatabase();
             }}>clear</button> */}
      </div>
      <ol class="documentsList">
        <For each={documents()}>
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
                      setProgram(program);
                      props.setPage("editor");
                    }}
                  >
                    {" "}
                    <img style={{ height: "3.5em" }} src={PlayPicto} />
                  </button>
                  <div class="documentItem-actions">
                    <button
                      onClick={() => {
                        deleteDocument(program.id);
                        refetch();
                      }}
                    >
                      <img
                        style={{ "vertical-align": "middle" }}
                        src={DeletePicto}
                      />
                    </button>
                    <button
                      onClick={() => {
                        const p = JSON.parse(JSON.stringify(program));
                        p.id = crypto.randomUUID();
                        saveDocument(p);
                        setProgram(p);
                        props.setPage("editor");
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