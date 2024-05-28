import { Root, createRoot } from 'react-dom/client';
import { FlowProps } from './components/Flow';
import App from './App';

class AppWebComponent extends HTMLElement {
  mountPoint!: HTMLDivElement;
  appRef!: Root;
  name!: string;
  shadowRoot;
  static observedAttributes = ['parentstate']; 

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
    this.renderDiagramComponent(this.parentstate);

    // * only a test for diagram to parent events
    // setTimeout(() => {
    //   this.emitUpdateParentStateEvent();
    // }, 5000);
  }

  // emitUpdateParentStateEvent() {
  //   const detail = {
  //     processFlowParentState: {test: true, name: 'Update parent state from diagram'}
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
  }

}

export default AppWebComponent;
