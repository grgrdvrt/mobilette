import { createSignal, Switch, Match } from "solid-js";

import "./App.css";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { EditorPage } from "./pages/EditorPage";

function App() {
  const [page, setPage] = createSignal("home");

  return (
    <Switch>
      <Match when={page() === "home"}>
        <HomePage setPage={setPage} />
      </Match>
      <Match when={page() === "about"}>
        <AboutPage setPage={setPage} />
      </Match>
      <Match when={page() === "editor"}>
        <EditorPage setPage={setPage} />
      </Match>
    </Switch>
  );
}

export default App;
