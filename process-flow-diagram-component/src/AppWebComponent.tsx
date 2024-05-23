import { Root, createRoot } from 'react-dom/client';
import { FlowProps } from './components/Flow';
import App from './App';

class AppWebComponent extends HTMLElement {
  mountPoint!: HTMLDivElement;
  appRef!: Root;
  name!: string;
  static observedAttributes = ['diagramstate']; 

  renderDiagramComponent(diagramState) {
    this.appRef.render(<App diagramData={diagramState} diagramStateHandlers={{clickEvent: this.handleClickEvent}}/>)
  }

  connectedCallback() {
    console.log('PROCESS-FLOW-DIAGRAM init connectedCallback')
    this.style.display = 'block';
    this.style.height = '100%';

    const shadowRoot = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    this.mountPoint.id = 'root';
    shadowRoot.appendChild(this.mountPoint);
    
    // todo using link ref in this way may require polyfill - check if required
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "process-flow-diagram-component.css");
    shadowRoot.appendChild(link);

    this.appRef = createRoot(this.mountPoint!);
    this.renderDiagramComponent(this.diagramstate)
  }

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

    setTimeout(() => {
      this.emitUpdateParentStateEvent();
    }, 5000);

  }

  attributeChangedCallback(attrName) {
    if (attrName === 'diagramstate') {
      this.renderDiagramComponent(this.diagramstate)
    }
  }

  // todo test event
  emitUpdateParentStateEvent() {
    const detail = {
      processFlowDiagramState: {test: true, name: 'Update parent state from diagram'}
    }
    const event = new CustomEvent("updateParentStateDetailEvent", {
      composed: true,
      bubbles: true,
      detail: detail,
    });
    this.dispatchEvent(event);
  }

  handleClickEvent = (...args) => {

    console.log('WC click event', args);
  }

}

export default AppWebComponent;
export interface ProcessFlowDiagramWrapperProps extends FlowProps {};
