import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { LogToolDbService } from '../log-tool-db.service';
import { LogToolDbData } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';

@Component({
    selector: 'app-export-modal',
    templateUrl: './export-modal.component.html',
    styleUrls: ['./export-modal.component.css'],
    standalone: false
})
export class ExportModalComponent implements OnInit {
  
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;
  
  dataExists: boolean = false;
  data: LogToolDbData;
  exportName: string;
  constructor(private logToolService: LogToolService, private logToolDbService: LogToolDbService, private windowRefService: WindowRefService) { }

  ngOnInit(){
    const date = new Date();
    const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
    this.exportName = 'ExplorerData_' + dateStr;    
    this.getExportData();
  }

  ngAfterViewInit() {
    this.showExportModal();
  }

  showExportModal() {
    this.exportModal.show();
  }

  closeExportData(){
    this.exportModal.hide()
    this.exportModal.onHidden.subscribe(val => {
      this.logToolService.openExportData.next(false);
    });
  }
  
  getExportData(){
    this.data = this.logToolDbService.getLogToolDbDataObj();

    if(this.data){
      this.dataExists = true;
    }
  }

  memorySizeOf(obj) {
    var bytes = 0;
  
    function sizeOf(obj) {
      if (obj !== null && obj !== undefined) {
        switch (typeof obj) {
          case "number":
            bytes += 8;
            break;
          case "string":
            bytes += obj.length * 2;
            break;
          case "boolean":
            bytes += 4;
            break;
          case "object":
            var objClass = Object.prototype.toString.call(obj).slice(8, -1);
            if (objClass === "Object" || objClass === "Array") {
              for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                sizeOf(obj[key]);
              }
            } else bytes += obj.toString().length * 2;
            break;
        }
      }
      return bytes;
    }
  
    function formatByteSize(bytes) {
      if (bytes < 1024) return bytes + " bytes";
      else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
      else return (bytes / 1073741824).toFixed(3) + " GiB";
    }
  
    return formatByteSize(sizeOf(obj));
  }

  buildExportJSON() {    
    this.downloadData(this.data, this.exportName);
    this.closeExportData();
  }

  downloadData(data: any, name: string) {
    data.origin = 'AMO-LOG-TOOL-DATA';
    let stringifyData = JSON.stringify(data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    if (!name) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      name = 'ExplorerData_' + dateStr;
    }
    dlLink.setAttribute('download', name + '.json');
    dlLink.click();
  }

}
