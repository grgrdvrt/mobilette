/* @refresh reload */
import { Show } from "solid-js";
import { render } from "solid-js/web";

import { isMobile } from "./utils";

import "./index.css";
import App from "./App";

const root = document.getElementById("root");

render(
  () => (
    <Show when={isMobile} fallback={<p>Please open from a mobile device.</p>}>
      <App />
    </Show>
  ),
  root!,
);
