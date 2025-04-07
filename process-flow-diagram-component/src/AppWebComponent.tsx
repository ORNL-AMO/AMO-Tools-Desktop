import { Root, createRoot } from 'react-dom/client';
import App from './App';
import { CacheProvider } from '@emotion/react';
import createCache, { EmotionCache } from "@emotion/cache";
import { ProcessFlowParentState, FlowDiagramData, ProcessFlowDiagramState } from 'process-flow-lib';

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
  // * make MUI library styles available too shadowDom
  MUIStylesCache: EmotionCache;

  renderDiagramComponent(parentState: ProcessFlowParentState) {
    if (parentState && parentState.parentContainer) {
      this.appRef.render(
        <CacheProvider value={this.MUIStylesCache}>
          <App parentContainer={parentState.parentContainer}
            context={parentState.context}
            processDiagram={parentState.waterDiagram}
            shadowRoot={this.shadowRoot}
            saveFlowDiagramData={this.emitFlowDiagramDataUpdate}
            />
        </CacheProvider>
        )
    }
  }

  connectedCallback() {
    this.style.display = 'block';
    this.style.height = '100%';

    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    this.mountPoint.setAttribute('aria-hidden', 'false');
    this.mountPoint.id = 'root';
    this.shadowRoot.appendChild(this.mountPoint);
    
    // * using link ref in this way may require polyfill - check if required
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "process-flow-diagram-component.css");
    this.shadowRoot.appendChild(link);

    this.appRef = createRoot(this.mountPoint!);

    this.MUIStylesCache = createCache({
      key: 'css',
      prepend: true,
      container: this.shadowRoot,
    });

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

    // * see note at shadowRoot declaration
    this.shadowRoot.dispatchEvent(event);
  }
  
  disconnectedCallback() {
    this.appRef.unmount();
  }

  get parentstate() {
    const attrString = this.getAttribute("parentstate");
    if (attrString !== 'undefined' && attrString != null) {
      const diagramStateProperty = JSON.parse(attrString);
      return diagramStateProperty;
    } else {
      return undefined;
    }
  }

  set parentstate(newValue) {
    this.setAttribute("parentstate", JSON.stringify(newValue));
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'parentstate') {
      this.renderDiagramComponent(this.parentstate)
    }
  }
}

export default AppWebComponent;
