import {
  createEffect,
  createSignal,
  Setter,
  Signal,
  SignalOptions,
} from "solid-js";
import src from "./assets/home.png";
import { spriteSheetHeight, spriteSheetWidth } from "./data.ts";
import { isSetterCallback } from "./types.ts";

const imageDataScalar = 4;

export function strToRgb(str: string): Uint8ClampedArray {
  const target = new Uint8ClampedArray(imageDataScalar);
  for (let i = 0; i < 3; i++) {
    const j = i * 2 + 1;
    target[i] = parseInt(str.slice(j, j + 2), 16);
  }
  target[3] = 255;
  return target;
}

export function wrapN(length: number, n: number): number {
  return (n + length) % length;
}

export function createRecordWithKeys<Type>(
  cb: (key: string) => Type,
  keys: string[],
): Partial<Record<string, Type>> {
  return Object.fromEntries(keys.map((key) => [key, cb(key)]));
}

export function createSignalWithSetter<Type>(
  cb: (value: Type) => Type,
  value: Type,
  options?: SignalOptions<Type>,
): Signal<Type> {
  const [get, _set] = createSignal(value, options);
  const set = (arg: Parameters<Setter<Type>>[0]): Type =>
    _set((prev) => (isSetterCallback<Type>(arg) ? cb(arg(prev)) : cb(arg)));

  return [get, set as Setter<Type>] as const;
}

export function createPersistentSignal<Type>(
  key: string,
  value: Type,
): Signal<Type> {
  const item = localStorage.getItem(key);
  const signal = createSignal<Type>(item ? (JSON.parse(item) as Type) : value);
  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(signal[0]()));
  });
  return signal;
}

export function overwriteImageData(
  data: Uint8ClampedArray,
  replacements: Map<Uint8ClampedArray, Uint8ClampedArray>,
): void {
  for (let i = 0; i < data.length; i += imageDataScalar)
    replacements.forEach((target, source) => {
      if (source.every((n, j) => data[i + j] === n))
        target.forEach((n, j) => (data[i + j] = n));
    });
}

export function sliceImageData(
  source: ImageData,
  x = 0,
  y = 0,
  w = source.width,
  h = source.height,
): ImageData {
  let slice = new Uint8ClampedArray(imageDataScalar * w * h);

  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const sourceIndex = imageDataScalar * ((y + j) * source.width + (x + i));
      const targetIndex = imageDataScalar * (j * w + i);
      for (let n = 0; n < imageDataScalar; n++) {
        slice[targetIndex + n] = source.data[sourceIndex + n];
      }
    }
  }

  return new ImageData(slice, w, h, { colorSpace: source.colorSpace });
}

export async function loadSpriteSheetContext() {
  const spriteSheetCanvas = new OffscreenCanvas(
    spriteSheetWidth,
    spriteSheetHeight,
  );
  const spriteSheetContext = spriteSheetCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  if (!spriteSheetContext)
    throw new Error("Could not initialize sprite sheet context.");

  const spriteSheetImage = new Image(spriteSheetWidth, spriteSheetHeight);
  spriteSheetImage.src = src;

  await new Promise<void>(function (resolve, reject) {
    const timeout = setTimeout(function () {
      reject(new Error("Unable to load sprite sheet image."));
    }, 300);
    spriteSheetImage.onload = function () {
      clearTimeout(timeout);
      spriteSheetContext.drawImage(spriteSheetImage, 0, 0);
      resolve();
    };
  });

  return spriteSheetContext;
}
