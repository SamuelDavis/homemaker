import { createEffect, createMemo, createRoot } from "solid-js";
import {
    createSignal,
    CustomAudio,
    wrapN
} from "../util";
import { AudioState } from "../types";
import { songs } from "../data";


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
    const getSongName = createMemo(() => songs[getIndex()]
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

