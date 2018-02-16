import { Injectable, ElementRef } from '@angular/core';
@Injectable()
export class SvgToPngService {

  constructor() { }

  //saves an svg chart as a png given a chart 
  // element containing an svg and a file name
  exportPNG(element: ElementRef, fn: string) {
    let exportFunc = require("save-svg-as-png/saveSvgAsPng.js");
    let svg;
    for (let i = 0; i < element.nativeElement.children.length; i++) {
      if (element.nativeElement.children[i].nodeName.trim() == "svg") {
        console.log("found an svg");
        svg = element.nativeElement.children[i];
      }
    }
    svg.style = "background-color: #fff";
    exportFunc.saveSvgAsPng(svg, fn.trim());
    svg.style = "background-color: none";
  }


  getPNG() {

  }
}
