import { Component, Signal } from "solid-js";

const Integer: Component<{
  label: string;
  number: Signal<number>;
}> = (props) => {
  const [get, set] = props.number;
  return (
    <label>
      <span>{props.label}</span>
      <input
        type="number"
        value={get()}
        onInput={(e) => set(parseInt(e.currentTarget.value))}
      />
    </label>
  );
};

export default Integer;
