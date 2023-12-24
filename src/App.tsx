import { For } from "solid-js";
import { color, music, render } from "./state.ts";
import { layerNames } from "./data.ts";
import Color from "./components/Color.tsx";
import { assertDefined } from "./types.ts";
import Range from "./components/Range.tsx";
import Carousel from "./components/Carousel.tsx";

function App() {
  return (
    <main>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>Music</legend>
          <Carousel signal={music.index}>{music.getSongName()}</Carousel>
          <section>
            <Range
              label="Volume"
              signal={music.volume}
              min={0}
              max={1}
              step={0.01}
            />
            <button type="button" onClick={music.togglePlaying}>
              <i class="material-icons">
                {music.getIsPlaying() ? "pause" : "play_arrow"}
              </i>
            </button>
          </section>
        </fieldset>
        <fieldset>
          <legend>Color</legend>
          <section>
            <Color label={"Primary"} signal={color.primary} />
            <Color label={"Secondary"} signal={color.secondary} />
          </section>
        </fieldset>
      </form>
      <article>
        <For each={layerNames}>
          {(name) => (
            <Carousel
              signal={assertDefined(
                `${name} frame signal`,
                render.frames[name],
              )}
            >
              {assertDefined(`${name} context`, render.contexts[name]).canvas}
            </Carousel>
          )}
        </For>
      </article>
      <footer></footer>
    </main>
  );
}

export default App;
