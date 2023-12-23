import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import {
  createPersistentSignal,
  createRecordWithKeys,
  createSignalWithSetter,
  loadSpriteSheetContext,
  overwriteImageData,
  sliceImageData,
  strToRgb,
  wrapN,
} from "./util.ts";
import { assertDefined, logDefined, RGB } from "./types.ts";
import {
  frameCountByName,
  frameHeight,
  frameWidth,
  getFrame,
  layerNames,
} from "./data.ts";

export const color = createRoot(() => {
  const primary = createPersistentSignal("primary", "#FFFFFF");
  const [getPrimary] = primary;
  const secondary = createPersistentSignal("secondary", "#000000");
  const [getSecondary] = secondary;
  const getReplacements = createMemo(() => {
    const replacements = new Map<Uint8ClampedArray, Uint8ClampedArray>();
    replacements.set(RGB.Red, strToRgb(getPrimary()));
    replacements.set(RGB.Green, strToRgb(getSecondary()));
    return replacements;
  });

  return { primary, secondary, getReplacements } as const;
});

export const render = createRoot(() => {
  const [getSpriteSheetContext, setSpriteSheetContext] =
    createSignal<OffscreenCanvasRenderingContext2D>();
  const contexts = createRecordWithKeys((name) => {
    const canvas = document.createElement("canvas");
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    canvas.style.setProperty("--width", canvas.width.toString());
    canvas.style.setProperty("--height", canvas.height.toString());
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(`Could not initialize context for ${name} canvas.`);
    return context;
  }, layerNames);
  const frames = createRecordWithKeys(
    (name) =>
      createSignalWithSetter((n) => wrapN(frameCountByName[name], n), 0, {
        equals: false,
      }),
    layerNames,
  );

  function callback() {
    const spriteSheetContext = logDefined(
      "sprite sheet context",
      getSpriteSheetContext(),
    );
    if (!spriteSheetContext) return;
    const colorReplacements = color.getReplacements();

    const { width, height } = spriteSheetContext.canvas;
    const spriteSheetImageData = spriteSheetContext.getImageData(
      0,
      0,
      width,
      height,
    );
    overwriteImageData(spriteSheetImageData.data, colorReplacements);

    for (const name of layerNames) {
      const index = assertDefined(`${name} frame`, frames[name]?.[0]());
      const frame = assertDefined(
        `frame ${index} of ${name}`,
        getFrame(name, index),
      );
      const context = assertDefined(`${name} context`, contexts[name]);
      const slice = sliceImageData(
        spriteSheetImageData,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
      );

      requestAnimationFrame(function () {
        const { width, height } = context.canvas;
        context.clearRect(0, 0, width, height);
        context.putImageData(slice, 0, 0);
      });
    }
  }

  loadSpriteSheetContext().then(setSpriteSheetContext);
  createEffect(callback);

  return {
    callback,
    contexts,
    frames,
  } as const;
});
