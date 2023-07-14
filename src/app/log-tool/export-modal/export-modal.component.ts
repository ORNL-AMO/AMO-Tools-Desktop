import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { LogToolDbService } from '../log-tool-db.service';
import { LogToolDbData } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';
import * as pako from 'pako';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.css']
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
    this.logToolDbService.saveData();
   
    this.data = this.logToolDbService.getSavedData();
    if(this.data){
      this.dataExists = true;
    }
  }

  buildExportJSON() {    
    this.downloadData(this.data, this.exportName);
    this.closeExportData();
  }

  buildExportZip() {    
    this.downloadZipData(this.data, this.exportName);
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

  downloadZipData(data: any, name: string) {
    data.origin = 'AMO-LOG-TOOL-DATA';
    let stringifyData = JSON.stringify(data);
    let gzip = pako.gzip(stringifyData , {to: 'string'});
    let blob = new Blob([gzip], { type: 'application/octet-stream' });
    let url = URL.createObjectURL(blob);
    let dlLink = document.createElement('a');
    dlLink.href = url;
    if (!name) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      name = 'ExplorerData_' + dateStr;
    }
    dlLink.setAttribute('download', name + '.gz');
    dlLink.click();
  }

}
