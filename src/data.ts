import { frames, meta } from "./assets/home.json";

export const layerNames = meta.layers.reverse().map((layer) => layer.name);
export const spriteSheetWidth = meta.size.w;
export const spriteSheetHeight = meta.size.h;
export const frameWidth = spriteSheetWidth / frames.length;
export const frameHeight = spriteSheetHeight;
export const frameCount = frames.length;
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
