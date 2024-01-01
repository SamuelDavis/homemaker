import { color, music, ui } from "../state";
import { preventDefault } from "../util";
import Carousel from "./Carousel";
import Color from "./Color";
import Range from "./Range";

const Controls = () => {
  return (
    <form classList={ui.getHiddenClassList()} onSubmit={preventDefault}>
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
          <Color label={"Tertiary"} signal={color.tertiary} />
        </section>
      </fieldset>
    </form>
  );
};

export default Controls;
