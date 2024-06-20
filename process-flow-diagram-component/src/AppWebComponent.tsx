import { Root, createRoot } from 'react-dom/client';
import App from './App';
import { FlowDiagramData, ProcessFlowDiagramState, ProcessFlowParentState } from '../../src/process-flow-types/shared-process-flow-types';

class AppWebComponent extends HTMLElement {
  mountPoint!: HTMLDivElement;
  appRef!: Root;
  name!: string;
  static observedAttributes = ['parentstate']; 
  // * NOTE: 
  // * 1. shadowRoot is typically a scoped variable only used for attaching shadow and setting mount point
  // * it was changed to be a class property here so it could be passed to DownloadImage, which requires a dom ref.
  // * 2. Due to this change, events must now be dispatched from shadowRoot, instead of 'this' (AppWebComponent)
  shadowRoot;

  renderDiagramComponent(parentState: ProcessFlowParentState) {
    if (parentState.parentContainer) {
      this.appRef.render(
        <App parentContainer={parentState.parentContainer}
        context={parentState.context}
        flowDiagramData={parentState.waterDiagram.flowDiagramData}
        shadowRoot={this.shadowRoot}
        clickEvent={this.handleClickEvent}
        saveFlowDiagramData={this.emitFlowDiagramDataUpdate}
        />)
    }
  }

  connectedCallback() {
    this.style.display = 'block';
    this.style.height = '100%';

    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    this.mountPoint.id = 'root';
    this.shadowRoot.appendChild(this.mountPoint);
    
    // * using link ref in this way may require polyfill - check if required
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "process-flow-diagram-component.css");
    this.shadowRoot.appendChild(link);

    this.appRef = createRoot(this.mountPoint!);
    if (this.parentstate) {
      this.renderDiagramComponent(this.parentstate);
    }
  }

  emitFlowDiagramDataUpdate(flowDiagramData: FlowDiagramData) {
    const detail: ProcessFlowDiagramState = {
      // todo 6387 set context on 'this' when parent is passed
      context: 'water',  
      flowDiagramData: flowDiagramData
    }

    const event = new CustomEvent("updateDiagramDetailEvent", {
      composed: true,
      bubbles: true,
      detail: detail,
    });

    // * see note at shadowRoot decl
    this.shadowRoot.dispatchEvent(event);
  }
  
  disconnectedCallback() {
    this.appRef.unmount();
  }

  get parentstate() {
    const attrString = this.getAttribute("parentstate");
    const diagramStateProperty = JSON.parse(attrString);
    return diagramStateProperty;
  }

  set parentstate(newValue) {
    // const newValue = coerceType(value);
    this.setAttribute("parentstate", JSON.stringify(newValue));
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'parentstate') {
      this.renderDiagramComponent(this.parentstate)
    }
  }

  handleClickEvent = (...args) => {
    console.log(...args)
  }
}

export default AppWebComponent;
