import './App.css'
import { ProcessFlowDiagramWrapperProps } from './AppWebComponent';
import Flow from './components/Flow';

function App(props?: ProcessFlowDiagramWrapperProps) {
  if (!props.measurStateHandlers) {
    // todo get default examle data
    props = {
      diagramData: undefined,
      measurStateHandlers: {
        clickEvent: () => {}
    }
  }

  }
  return (
    <div className={'wc-app-container'}>
      <header className={'wc-app-header'}>Process Flow Diagram - React Flow</header>
      <Flow {...props}/>
    </div>
  );
}

export default App
