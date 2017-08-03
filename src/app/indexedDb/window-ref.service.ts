import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';


declare var webshot;

function getWindow(): any {
  return window;
}

@Injectable()
export class WindowRefService {
  get nativeWindow(): any {
    return getWindow();
  }
  constructor( @Inject(DOCUMENT) private document: any) { }

  getDoc() {
    return this.document;
  }

  takeScreenShot() {
    let doc = this.getDoc();
    webshot(doc.documentElement.innerHTML, 'hello_world.png', { siteType: 'html' }, function (err) {
      // screenshot now saved to hello_world.png 
    });
    debugger
  }
}
