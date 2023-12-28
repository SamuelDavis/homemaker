import {
  createEffect,
  createSignal as _createSignal,
  Setter,
  Signal,
  SignalOptions,
} from "solid-js";
import src from "./assets/home.png";
import { spriteSheetHeight, spriteSheetWidth } from "./data.ts";
import { isSetterCallback } from "./types.ts";

const imageDataScalar = 4;

export function createSignal<Type>(
  value: Type,
  options?: SignalOptions<Type> & {
    persistenceKey?: string;
    setter?: (next: Type, previous?: Type) => Type;
  },
): Signal<Type> {
  const { persistenceKey, setter, ...rest } = options ?? {};
  const [get, _set] = _createSignal<Type>(value, rest);

  const set =
    setter === undefined
      ? _set
      : (arg: Parameters<typeof _set>[0]) =>
          _set((prev) =>
            isSetterCallback<Type>(arg)
              ? setter(arg(prev), prev)
              : setter(arg, prev),
          );

  if (typeof persistenceKey === "string") {
    if (persistenceKey in localStorage)
      set(JSON.parse(localStorage.getItem(persistenceKey)!));
    createEffect(() =>
      localStorage.setItem(persistenceKey, JSON.stringify(get())),
    );
  }

  return [get, set as Setter<Type>];
}

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
  return Number.isInteger(n) ? (n + length) % length : 0;
}

export function createRecordWithKeys<Type>(
  cb: (key: string) => Type,
  keys: string[],
): Partial<Record<string, Type>> {
  return Object.fromEntries(keys.map((key) => [key, cb(key)]));
}

export function overwriteImageData(
  data: Uint8ClampedArray,
  replacements: Map<Uint8ClampedArray, Uint8ClampedArray>,
  variance = 0.1,
): void {
  variance *= 255;
  for (let i = 0; i < data.length; i += imageDataScalar)
    replacements.forEach((target, source) => {
      if (
        source.every((n, j) => {
          const check = data[i + j];
          return n - variance <= check && n + variance >= check;
        })
      )
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

export function randomFromArray<Type>(array: Type[]): Type {
  return array[Math.floor(Math.random() * array.length)];
}

export class CustomAudio extends Audio {
  pause() {
    super.pause();
    this.dispatchEvent(new Event("pause"));
  }
}

export function preventDefault(event: Event) {
  event.preventDefault();
}

