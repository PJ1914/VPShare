import PlaygroundEditor from '../components/PlaygroundEditor';
import ErrorBoundary from '../components/PlaygroundEditor';
import '../styles/PlaygroundEditor.css';

function Playground() {
  return (
    <div className="playground-wrapper">
      <h2 className="playground-title">Coding Playground</h2>
      <ErrorBoundary>
        <PlaygroundEditor />
      </ErrorBoundary>
    </div>
  );
}

export default Playground;