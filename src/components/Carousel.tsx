import { children, Component, Signal, splitProps } from "solid-js";
import { WrapperProps } from "../types.ts";
import IconButton from "./IconButton.tsx";

const Carousel: Component<
  WrapperProps<"section"> & {
    signal: Signal<number>;
  }
> = (props) => {
  const [localProps, propsRest] = splitProps(props, ["children", "signal"]);
  const getChildren = children(() => localProps.children);
  const [, set] = localProps.signal;
  const increment = () => set((n) => n + 1);
  const decrement = () => set((n) => n - 1);

  return (
    <section {...propsRest}>
      <IconButton icon="chevron_left" onClick={decrement} />
      {getChildren()}
      <IconButton icon="chevron_right" onClick={increment} />
    </section>
  );
};

export default Carousel;
