import { Setter } from "solid-js";

import HomePicto from "../assets/home_FILL0_wght400_GRAD0_opsz24.svg";

export function DocumentationPage(props: { setPage: Setter<string> }) {
  return (
    <div class="documentation" onClick={() => props.setPage("home")}>
      <div class="home-title">
        <h1 class="mainTitle">Mobilette</h1>
        <h2 class="subtitle">.computer</h2>
      </div>
      <button onClick={() => props.setPage("home")}>
        <img src={HomePicto} />
      </button>
      <section>
        <p>
          Mobilette is a small programming language and interface for creative
          coding on mobile.
        </p>
      </section>
      <section>
        <h3>Instructions</h3>
        <h3>Registers</h3>
        <h3>Data Types</h3>
      </section>
      <section>
        <h2>Programming</h2>
        <p>
          From the Editor, tap on "+" to add an empty line. When an empty line
          is selected, you can select an instruction. When an instruction is
          selected, you can access its parameters slots. Tap on a slot to select
          a register or a value.
        </p>
      </section>
    </div>
  );
}
