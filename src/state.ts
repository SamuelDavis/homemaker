import { createEffect, createMemo, createRoot } from "solid-js";
import {
  createRecordWithKeys,
  createSignal,
  CustomAudio,
  loadSpriteSheetContext,
  overwriteImageData,
  sliceImageData,
  strToRgb,
  wrapN,
} from "./util.ts";
import { assertDefined, AudioState, logDefined, RGB } from "./types.ts";
import {
  frameCountByName,
  frameHeight,
  frameWidth,
  getFrame,
  getLightingFrame,
  layerNames,
  songs,
} from "./data.ts";

export const ui = createRoot(() => {
  const [getHidden, setHidden] = createSignal(false);
  const toggleHidden = () => setHidden((prev) => !prev);
  const getHiddenClassList = createMemo(() => ({
    hidden: getHidden(),
  }));

  return { toggleHidden, getHiddenClassList };
});

export const color = createRoot(() => {
  const primary = createSignal("#FF0000", { persistenceKey: "primary" });
  const [getPrimary] = primary;
  const secondary = createSignal("#00FF00", { persistenceKey: "secondary" });
  const [getSecondary] = secondary;
  const tertiary = createSignal("#0000FF", { persistenceKey: "tertiary" });
  const [getTertiary] = tertiary;
  const getReplacements = createMemo(() => {
    const replacements = new Map<Uint8ClampedArray, Uint8ClampedArray>();
    replacements.set(RGB.Red, strToRgb(getPrimary()));
    replacements.set(RGB.Green, strToRgb(getSecondary()));
    replacements.set(RGB.Blue, strToRgb(getTertiary()));
    return replacements;
  });

  return { primary, secondary, tertiary, getReplacements } as const;
});

export const render = createRoot(() => {
  const [getSpriteSheetContext, setSpriteSheetContext] = createSignal<
    OffscreenCanvasRenderingContext2D | undefined
  >(undefined);
  const lightingCanvas = new OffscreenCanvas(frameWidth, frameHeight);
  const lightingContext = assertDefined(
    "lighting context",
    lightingCanvas.getContext("2d")
  );

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
      createSignal(0, {
        equals: false,
        setter: (value) => wrapN(frameCountByName[name], value),
        persistenceKey: `${name}-frame`,
      }),
    layerNames
  );

  function callback() {
    const spriteSheetContext = logDefined(
      "sprite sheet context",
      getSpriteSheetContext()
    );
    if (!spriteSheetContext) return;
    const colorReplacements = color.getReplacements();

    const { width, height } = spriteSheetContext.canvas;
    const spriteSheetImageData = spriteSheetContext.getImageData(
      0,
      0,
      width,
      height
    );
    overwriteImageData(spriteSheetImageData.data, colorReplacements);

    for (const name of layerNames) {
      const index = assertDefined(`${name} frame`, frames[name]?.[0]());
      const imageFrame = assertDefined(
        `frame ${index} of ${name}`,
        getFrame(name, index)
      );
      const lightingFrame = getLightingFrame(name, index);
      const context = assertDefined(`${name} context`, contexts[name]);
      const imageSlice = sliceImageData(
        spriteSheetImageData,
        imageFrame.x,
        imageFrame.y,
        imageFrame.w,
        imageFrame.h
      );

      const lightingSlice = lightingFrame
        ? sliceImageData(
            spriteSheetImageData,
            lightingFrame.x,
            lightingFrame.y,
            lightingFrame.w,
            lightingFrame.h
          )
        : undefined;

      requestAnimationFrame(function () {
        const { width, height } = context.canvas;
        context.clearRect(0, 0, width, height);
        context.putImageData(imageSlice, 0, 0);
        context.globalAlpha = 0.5;
        if (lightingSlice) {
          lightingContext.clearRect(
            0,
            0,
            lightingContext.canvas.width,
            lightingContext.canvas.height
          );
          lightingContext.putImageData(lightingSlice, 0, 0);
          context.drawImage(lightingContext.canvas, 0, 0);
        }
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

export const music = createRoot(() => {
  const index = createSignal(0, {
    persistenceKey: "songIndex",
    setter: (value) => wrapN(songs.length, value),
    equals: false,
  });
  const [getIndex] = index;
  const [getState, setState] = createSignal(AudioState.New);
  const volume = createSignal(0, {
    persistenceKey: "volume",
    setter: (value) => Math.max(0, Math.min(1, value)),
  });
  const [getVolume] = volume;
  const getIsPlaying = createMemo(() => getState() === AudioState.Playing);
  const getSongName = createMemo(() =>
    songs[getIndex()]
      .split("/")
      .pop()!
      .split("_")
      .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(" ")
      .replace(/[.\-].*$/, "")
  );

  const audio = new CustomAudio();
  audio.addEventListener("ended", () => setState(AudioState.Ended));
  audio.addEventListener("pause", () => setState(AudioState.Paused));
  audio.addEventListener("play", () => setState(AudioState.Playing));

  createEffect(() => {
    audio.volume = getVolume();
  });

  createEffect(async () => {
    const index = getIndex();
    audio.src = songs[index];
    await audio.play();
  });

  const togglePlaying = () => (getIsPlaying() ? audio.pause() : audio.play());

  return { index, getSongName, getIsPlaying, togglePlaying, volume };
});
