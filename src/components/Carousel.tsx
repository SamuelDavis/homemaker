import { children, Component, Signal, splitProps } from "solid-js";
import { WrapperProps } from "../types.ts";

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
      <button onClick={decrement}>
        <i class="material-icons">chevron_left</i>
      </button>
      {getChildren()}
      <button onClick={increment}>
        <i class="material-icons">chevron_right</i>
      </button>
    </section>
  );
};

export default Carousel;
