import { For } from "solid-js";
import { layerNames } from "../data.ts";
import { render } from "../state.ts";
import { assertDefined } from "../types.ts";
import Carousel from "./Carousel.tsx";

const Graphics = () => {
  return (
    <article>
      <For each={layerNames}>
        {(name) => (
          <Carousel
            signal={assertDefined(`${name} frame signal`, render.frames[name])}
          >
            {assertDefined(`${name} context`, render.contexts[name]).canvas}
          </Carousel>
        )}
      </For>
    </article>
  );
};

export default Graphics;
