import './App.css'
import Diagram from './components/Diagram/Diagram';
import { DiagramProps } from './components/Diagram/Diagram';
import { OpenDiagramCalculatorFn } from 'process-flow-lib';
import { DiagramCalculatorContext } from './components/Calculators/DiagramCalculatorContext';


function App(props?: ProcessFlowDiagramWrapperProps) {
  let availableHeight = props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight;

  return (
    availableHeight &&
      <div className={'wc-app-container'} style={{height: availableHeight}}>
        <DiagramCalculatorContext.Provider value={props.openCalculatorFn}>
          <Diagram {...props} height={availableHeight}/>
        </DiagramCalculatorContext.Provider>
      </div>
  );
}

export default App;

export interface ProcessFlowDiagramWrapperProps extends DiagramProps {
    context: string;
    openCalculatorFn?: OpenDiagramCalculatorFn;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
};
