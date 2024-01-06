import { Component, splitProps } from "solid-js";
import { InputProps } from "../types";

const Range: Component<InputProps<number>> = (props) => {
  const [propsLocal, propsRest] = splitProps(props, ["label", "signal"]);
  const [get, set] = propsLocal.signal;
  return (
    <label>
      <span>{propsLocal.label}</span>
      <input
        type="range"
        value={get()}
        onInput={(e) => set(parseFloat(e.currentTarget.value))}
        {...propsRest}
      />
      <output>{Math.floor(get() * 100)}%</output>
    </label>
  );
};

export default Range;
