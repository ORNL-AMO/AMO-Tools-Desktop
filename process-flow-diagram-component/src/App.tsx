import './App.css'
import Diagram from './components/Diagram/Diagram';
import { DiagramProps } from './components/Diagram/Diagram';

function App(props?: ProcessFlowDiagramWrapperProps) {
  let availableHeight = props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight;

  return (
    availableHeight &&
      <div className={'wc-app-container'} style={{height: availableHeight}}>
        <Diagram {...props} height={availableHeight}/>
      </div>
  );
}

export default App;

export interface ProcessFlowDiagramWrapperProps extends DiagramProps {
    context: string;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
};
