import {
  createSignal,
  createSelector,
  createResource,
  For,
  Setter,
} from "solid-js";

// import RegistersPicto from "./assets/grid_view_FILL0_wght400_GRAD0_opsz24.svg";

import DeletePicto from "../assets/delete_FILL0_wght400_GRAD0_opsz24.svg";
import DownloadPicto from "../assets/download_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg";
import ForkPicto from "../assets/arrow_split_FILL0_wght400_GRAD0_opsz24.svg";
import PlayPicto from "../assets/play_circle_FILL0_wght400_GRAD0_opsz24.svg";

import { createEmptyProgram, fork, setProgram } from "../store";

import { saveDocument, getDocuments, deleteDocument } from "../db";

export function HomePage(props: { setPage: Setter<string> }) {
  const [documents, { refetch }] = createResource(getDocuments);
  const [selected, setSelected] = createSignal<string | null>(null);
  const isSelected = createSelector(selected);
  return (
    <div class="home" onClick={() => setSelected(null)}>
      <div class="home-title">
        <h1 class="mainTitle">Mobilette</h1>
        <h2 class="subtitle">.computer</h2>
      </div>
      <p>
        Mobilette is a small programming language and interface for creative
        coding on mobile.
      </p>
      <div class="home-actions">
        {/*
          <button
            class="home-action"
            onClick={() => {
              props.setPage("documentation");
            }}
          >
            Doc
          </button>
          */}
        <button
          class="home-action"
          onClick={() => {
            props.setPage("examples");
          }}
        >
          Examples
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
                        fork(program);
                        refetch();
                      }}
                    >
                      <img
                        style={{ "vertical-align": "middle" }}
                        src={ForkPicto}
                      />
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(program)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `mobilette_program.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <img
                        style={{ "vertical-align": "middle" }}
                        src={DownloadPicto}
                      />
                    </button>
                  </div>
                </div>
              </li>
            );
          }}
        </For>
      </ol>
      <div class="home-actions">
        <button
          class="home-action"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  const p = JSON.parse(content);
                  p.id = crypto.randomUUID();
                  saveDocument(p);
                };
                reader.readAsText(file);
              }
            };
            input.click();
          }}
        >
          Import
        </button>
      </div>
    </div>
  );
}
