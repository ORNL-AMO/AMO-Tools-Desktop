import AppWebComponent from "./AppWebComponent";

window.customElements.get("process-flow-diagram-component") ||
window.customElements.define("process-flow-diagram-component", AppWebComponent);