import { createSignal, Switch, Match } from "solid-js";

import "./App.css";
import { HomePage } from "./pages/HomePage";
import { DocumentationPage } from "./pages/DocumentationPage";
import { EditorPage } from "./pages/EditorPage";

function App() {
  const [page, setPage] = createSignal("home");

  return (
    <Switch>
      <Match when={page() === "home"}>
        <HomePage setPage={setPage} />
      </Match>
      <Match when={page() === "documentation"}>
        <DocumentationPage setPage={setPage} />
      </Match>
      <Match when={page() === "editor"}>
        <EditorPage setPage={setPage} />
      </Match>
    </Switch>
  );
}

export default App;
