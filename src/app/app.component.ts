import { Component, ViewEncapsulation, ViewContainerRef, HostListener } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef;
  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }
  // Triggers the "focus" event for an input, or a label's associated input, even if it's disabled, to always show help text. (#5655)
  @HostListener("click", ['$event']) onClick(e: MouseEvent){
    let element = e.target;
  
    if (element instanceof HTMLElement) {
      if (element.hasAttribute('disabled')) {
        let evt = new Event('focus', {bubbles: false, cancelable: true});
        element.dispatchEvent(evt);
      }
      else if (element.hasAttribute('for') && element.tagName === 'LABEL') {
        let inputElem = document.getElementById(element.getAttribute('for'));
  
        if (inputElem && inputElem.hasAttribute('disabled')) {
          let evt = new Event('focus', {bubbles: false, cancelable: true});
          inputElem.dispatchEvent(evt);
        }
      }
    }
  }
}

