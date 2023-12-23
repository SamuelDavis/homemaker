import { frames, meta } from "./assets/home.json";
import music1 from "./assets/deck_the_halls.opus";
import music2 from "./assets/jingle_bells.opus";
import music3 from "./assets/we_wish_you_a_merry_christmas.opus";

export const songs = [music1, music2, music3];
export const layerNames = meta.layers.reverse().map((layer) => layer.name);
export const spriteSheetWidth = meta.size.w;
export const spriteSheetHeight = meta.size.h;
export const frameCount = frames.length;
export const frameWidth = spriteSheetWidth / frameCount;
export const frameHeight = spriteSheetHeight;
export const frameCountByName = Object.fromEntries(
  layerNames.map((name) => [
    name,
    frames.filter((frame) => frame.filename.startsWith(name)).length,
  ]),
);

export function getFrame(name: string, index: number) {
  const filename = `${name}.${index}`;
  return frames.find((frame) => frame.filename === filename)?.frame;
}
