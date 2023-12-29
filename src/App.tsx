import IconButton from "./components/IconButton.tsx";
import Controls from "./components/Controls.tsx";
import Graphics from "./components/Graphics.tsx";
import { ui } from "./state.ts";

function App() {
  return (
    <main>
      <IconButton icon="tune" class="controls" onClick={ui.toggleHidden} />
      <Controls />
      <Graphics />
    </main>
  );
}

export default App;
