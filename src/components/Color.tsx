import { Component, splitProps } from "solid-js";
import { InputProps } from "../types";

const Color: Component<InputProps<string>> = (props) => {
  const [propsLocal, propsRest] = splitProps(props, ["label", "signal"]);
  const [get, set] = propsLocal.signal;
  return (
    <label>
      <span>{propsLocal.label}</span>
      <input
        type="color"
        value={get()}
        onInput={(e) => set(e.currentTarget.value)}
        {...propsRest}
      />
    </label>
  );
};

export default Color;
