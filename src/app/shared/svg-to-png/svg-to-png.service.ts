import { Injectable, ElementRef } from '@angular/core';
import { ImportExportService } from '../import-export/import-export.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
@Injectable()
export class SvgToPngService {

  constructor(private importExportService: ImportExportService, private windowRefService: WindowRefService) { }

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

    //remove backgroundColor option to get transparent background
    exportFunc.svgAsPngUri(svg, {backgroundColor: "#fff"}, (data) => {
      let doc = this.windowRefService.getDoc();
      let dlLink = doc.createElement("a");
      dlLink.setAttribute("type", "image");
      dlLink.setAttribute("href", data);
      dlLink.setAttribute("download", fn);
      dlLink.click()
    })
  }


  getPNG() {

  }
}
