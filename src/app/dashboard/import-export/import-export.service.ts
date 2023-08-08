import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { Directory } from '../../shared/models/directory';
import * as pako from 'pako';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ImportExportService {

  exportData: Array<any>;
  allDirectories: Directory;
  selectedItems: Array<any>;
  
  toggleDownload: BehaviorSubject<boolean>;
  exportInProgress: BehaviorSubject<boolean>;
  renderer: Renderer2;
  removeDownloadListener: () => void;

  constructor(private windowRefService: WindowRefService, 
    private rendererFactory: RendererFactory2
    ) {
    this.toggleDownload = new BehaviorSubject<boolean>(null);
    this.exportInProgress = new BehaviorSubject<boolean>(false);
    this.renderer = rendererFactory.createRenderer(null, null);

   }

  testIfOverLimit(data: any) { 
    data.origin = 'AMO-TOOLS-DESKTOP';
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    if (dataStr.length > 2090000) {
      return false;
    }else {
      return true;
    }
  }

  downloadData(data: any, name: string) {
    data.origin = 'AMO-TOOLS-DESKTOP';
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    if (!name) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      name = 'ExportedData_' + dateStr;
    }
    dlLink.setAttribute('download', name + '.json');
    this.setupDownloadEvent(dlLink);
  }

  downloadZipData(data: any, name: string) {
    data.origin = 'AMO-TOOLS-DESKTOP';
    let stringifyData = JSON.stringify(data);
    let gzip = pako.gzip(stringifyData);
    let blob = new Blob([gzip], { type: 'application/gzip' });
    let url = URL.createObjectURL(blob);
    let dlLink = document.createElement('a');
    dlLink.href = url;
    if (!name) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      name = 'ExportedData_' + dateStr;
    }
    dlLink.setAttribute('download', name + '.gz');
    this.setupDownloadEvent(dlLink);
  }

  setupDownloadEvent(dlLink) {
    this.renderer.setAttribute(dlLink, 'id', 'downloadAnchor');
    this.removeDownloadListener = this.renderer.listen(dlLink, 'click', (event) => {
      this.exportInProgress.next(false);  
    })

    dlLink.click();
  }

  downloadMaterialData(data: any, name?: string) {
    data.origin = 'AMO-TOOLS-DESKTOP-MATERIALS';
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    if (!name) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      name = 'ExportedMaterialData_' + dateStr;
    }
    dlLink.setAttribute('download', name + '.json');
    dlLink.click();
  }

  downloadOpportunities(data: any, name: string) {
    data.origin = 'AMO-TOOLS-DESKTOP-OPPORTUNITIES';
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    if (!name) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      name = 'ExportedOpportunityData_' + dateStr;
    }
    dlLink.setAttribute('download', name + '.json');
    dlLink.click();
  }

  downloadImage(data: any) {
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let newDataStr = data.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    dlLink.setAttribute("href", newDataStr);
    dlLink.setAttribute("download", "exportData.png");
    dlLink.click();
  }

  openMailTo() {
    let subject = "AMO Tools Feedback";
    let bodyMsg = "We appreciate your feedback. Please attach any screen shots or your current data set that you would like us to review.";
    let mailToString: string = 'mailto:accawigk@ornl.gov?subject=' + subject + '&body=' + bodyMsg;
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    dlLink.setAttribute("href", mailToString);
    dlLink.click();
  }

  createFile(dataUrl) {
    let doc = this.windowRefService.getDoc();
    var blob = this.dataURItoBlob(dataUrl);
    var fd = new FormData();
    fd.append("file", blob, "screenshot.png");
  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  srcToFile(src, fileName, mimeType) {
    return (fetch(src)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
    );
  }
}

