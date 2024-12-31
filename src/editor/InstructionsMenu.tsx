import { For, createSignal, Show } from "solid-js";
import { instructionsDefinitions } from "../language/language";
import { setCommand } from "../store";
export function InstructionsMenu() {
  const [selectedModule, setSelectedModule] = createSignal<string | null>(null);
  return (
    <div class="instructionsMenu">
      <Show when={selectedModule() !== null}>
        <ul>
          <For each={Object.keys(instructionsDefinitions[selectedModule()!])}>
            {(instructionName) => {
              return (
                <li>
                  <button
                    onClick={() =>
                      setCommand(selectedModule()!, instructionName)
                    }
                  >
                    {instructionName}
                  </button>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
      <ul>
        <For each={Object.keys(instructionsDefinitions)}>
          {(moduleName) => {
            return (
              <li>
                <button onClick={() => setSelectedModule(moduleName)}>
                  {moduleName}
                </button>
              </li>
            );
          }}
        </For>
      </ul>
    </div>
  );
}
