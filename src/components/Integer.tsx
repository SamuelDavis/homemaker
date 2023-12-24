import { Component, splitProps } from "solid-js";
import { InputProps } from "../types.ts";

const Integer: Component<InputProps<number>> = (props) => {
  const [propsLocal, propsRest] = splitProps(props, ["label", "signal"]);
  const [get, set] = propsLocal.signal;
  return (
    <label>
      <span>{propsLocal.label}</span>
      <input
        type="number"
        value={get()}
        onInput={(e) => set(parseInt(e.currentTarget.value))}
        {...propsRest}
      />
    </label>
  );
};

export default Integer;
