import { For } from "solid-js";
import { layerNames } from "../data";
import { render } from "../state";
import { assertDefined } from "../types";
import Carousel from "./Carousel";

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
