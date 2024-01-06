import { createMemo, createRoot } from "solid-js";
import { createSignal, strToRgb } from "../util";
import { RGB } from "../types";


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

