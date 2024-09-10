import './App.css'
import Flow, { FlowProps } from './components/Flow';

function App(props?: ProcessFlowDiagramWrapperProps) {
  let availableHeight = props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight;

  return (
    availableHeight &&
      <div className={'wc-app-container'} style={{height: availableHeight}}>
        <Flow {...props} height={availableHeight}/>
      </div>
  );
}

export default App;

export interface ProcessFlowDiagramWrapperProps extends FlowProps {
    context: string;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
};
