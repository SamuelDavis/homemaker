import { createMemo, createRoot } from "solid-js";
import { createSignal } from "../util";


export const ui = createRoot(() => {
    const [getHidden, setHidden] = createSignal(false);
    const toggleHidden = () => setHidden((prev) => !prev);
    const getHiddenClassList = createMemo(() => ({
        hidden: getHidden(),
    }));

    return { toggleHidden, getHiddenClassList };
});

