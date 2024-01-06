import IconButton from "./components/IconButton";
import Controls from "./components/Controls";
import Graphics from "./components/Graphics";
import { ui } from "./state";

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
