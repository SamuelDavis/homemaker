import { For } from "solid-js";
import { color, music, render } from "./state.ts";
import { layerNames } from "./data.ts";
import Integer from "./components/Integer.tsx";
import Color from "./components/Color.tsx";
import { assertDefined } from "./types.ts";
import Range from "./components/Range.tsx";

function App() {
  return (
    <main>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>Music</legend>
          <Integer label={music.getSongName()} signal={music.index} />
          <Range
            label="Volume"
            signal={music.volume}
            min={0}
            max={1}
            step={0.01}
          />
          <button type="button" onClick={music.togglePlaying}>
            {music.getIsPlaying() ? "Pause" : "Play"}
          </button>
        </fieldset>
        <fieldset>
          <legend>Frames</legend>
          <For each={layerNames}>
            {(name) => (
              <Integer
                label={name}
                signal={assertDefined(
                  `${name} frame signal`,
                  render.frames[name],
                )}
              />
            )}
          </For>
        </fieldset>
        <Color label={"Primary"} signal={color.primary} />
        <Color label={"Secondary"} signal={color.secondary} />
      </form>
      <article>
        <For each={layerNames}>
          {(name) =>
            assertDefined(`${name} context`, render.contexts[name]).canvas
          }
        </For>
      </article>
    </main>
  );
}

export default App;
