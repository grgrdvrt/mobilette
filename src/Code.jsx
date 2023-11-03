import {
    createSignal,
    createEffect,
    onMount,
    Show,
    Switch,
    Match,
    For
} from 'solid-js';

export function Program({source, registers}){
    return(
        <For each={source}>
          {line => {
              return (
                  <p>{line[1]}<span> </span>
                    <For each={line.slice(2)}>
                      {p => {
                          const item = p.substr(2);
                          const register = registers.find(r => r.id === item);
                          return (
                              <Show when={p.substr(0, 2) === "r:"} fallback={<span>{item} </span>}>
                                <span style={{"background-color":register.color, "padding":"2px 3px", "border-radius":"3px"}}>
                                  {register.name || register.y + ":" + register.x}
                                </span>
                                <span> </span>
                              </Show>
                          );
                      }}
                    </For>
                  </p>
              );
          }}
        </For>
);
}
export function Code({source, registers}){
    return(
        <div style={{"font-family":"monospace"}}>
          <h3>Init</h3>
          <Program source={source.init} registers={registers}/>

          <hr/>
          <h3>Loop</h3>
          <Program source={source.loop} registers={registers}/>

          <hr/>
          <h3>On Pointer Down</h3>
          <Program source={source.pointerDown} registers={registers}/>

          <hr/>
          <h3>On Pointer Up</h3>
          <Program source={source.pointerUp} registers={registers}/>

          <hr/>
          <h3>On Pointer Move</h3>
          <Program source={source.pointerMove} registers={registers}/>
        </div>
    );
}
