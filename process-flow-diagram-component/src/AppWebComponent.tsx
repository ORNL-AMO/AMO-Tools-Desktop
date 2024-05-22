import { Root, createRoot } from 'react-dom/client';
import { FlowProps } from './components/Flow';
import App from './App';

class AppWebComponent extends HTMLElement {
  mountPoint!: HTMLDivElement;
  appRef!: Root;
  name!: string;
  shadowRoot;
  static observedAttributes = ['diagramstate']; 

  renderDiagramComponent(diagramState) {
    this.appRef.render(<App diagramData={diagramState} shadowRoot={this.shadowRoot} diagramStateHandlers={{clickEvent: this.handleClickEvent}}/>)
  }

  connectedCallback() {
    console.log('PROCESS-FLOW-DIAGRAM init connectedCallback')
    this.style.display = 'block';
    this.style.height = '100%';

    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    this.mountPoint.id = 'root';
    this.shadowRoot.appendChild(this.mountPoint);
    
    // todo using link ref in this way may require polyfill - check if required
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "process-flow-diagram-component.css");
    this.shadowRoot.appendChild(link);

    this.appRef = createRoot(this.mountPoint!);
    this.renderDiagramComponent(this.diagramstate);

    // * only a test for diagram to parent events
    // setTimeout(() => {
    //   this.emitUpdateParentStateEvent();
    // }, 5000);
  }

  // emitUpdateParentStateEvent() {
  //   const detail = {
  //     processFlowDiagramState: {test: true, name: 'Update parent state from diagram'}
  //   }
  //   const event = new CustomEvent("updateParentStateDetailEvent", {
  //     composed: true,
  //     bubbles: true,
  //     detail: detail,
  //   });
  //   this.dispatchEvent(event);
  // }
  
  disconnectedCallback() {
    this.appRef.unmount();
  }


  get diagramstate() {
    const attrString = this.getAttribute("diagramstate");
    const diagramStateProperty = JSON.parse(attrString);
    return diagramStateProperty;
  }

  set diagramstate(newValue) {
    // const newValue = coerceType(value);
    this.setAttribute("diagramstate", JSON.stringify(newValue));
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'diagramstate') {
      this.renderDiagramComponent(this.diagramstate)
    }
  }



  handleClickEvent = (...args) => {
  }

}

export default AppWebComponent;
