import { Injectable, Inject, DOCUMENT } from '@angular/core';

function getWindow(): any {
  return window;
}

@Injectable()
export class WindowRefService {
  get nativeWindow(): any {
    return getWindow();
  }
  constructor(@Inject(DOCUMENT) private document: Document) { }

  getDoc() {
    return this.document;
  }

  test() {
  }

 
}
