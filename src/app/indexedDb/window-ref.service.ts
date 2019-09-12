import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
function getWindow(): any {
  return window;
}

declare var screenshot;
declare var Pageres;
import { ElectronService } from 'ngx-electron';

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
