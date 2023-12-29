import { Component, JSX, splitProps } from "solid-js";
import { ui } from "../state";

const IconButton: Component<
  { icon: string } & JSX.IntrinsicElements["button"]
> = (props) => {
  const [localProps, propsRest] = splitProps(props, ["icon"]);
  return (
    <button type='button' classList={ui.getHiddenClassList()} {...propsRest}>
      <i class="material-icons">{localProps.icon}</i>
    </button>
  );
};

export default IconButton;
