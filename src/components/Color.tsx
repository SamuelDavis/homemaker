import { Component, Signal } from "solid-js";

const Color: Component<{ label: string; color: Signal<string> }> = (props) => {
  const [get, set] = props.color;
  return (
    <label>
      <span>{props.label}</span>
      <input
        type="color"
        value={get()}
        onInput={(e) => set(e.currentTarget.value)}
      />
    </label>
  );
};

export default Color;
