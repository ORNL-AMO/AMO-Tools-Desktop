import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { LogToolDbService } from '../log-tool-db.service';
import { LogToolDbData } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';
import { ImportExportService } from '../../shared/import-export/import-export.service';
import * as pako from 'pako';

@Component({
    selector: 'app-export-log-tool-modal',
    templateUrl: './export-modal.component.html',
    styleUrls: ['./export-modal.component.css'],
    standalone: false
})
export class ExportModalComponent implements OnInit {
  
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;
  
  dataExists: boolean = false;
  data: LogToolDbData;
  exportName: string;
  exceedsDownloadSizeLimit: boolean = false;
  isProcessing: boolean = false;
  constructor(private logToolService: LogToolService, 
    private importExportService: ImportExportService, 
    private logToolDbService: LogToolDbService, 
    private windowRefService: WindowRefService) { }

  ngOnInit(){
    this.isProcessing = true;
  }

  ngAfterViewInit() {
    this.exportModal.show();
    setTimeout(() => {
    const date = new Date();
    const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
    this.exportName = 'ExplorerData_' + dateStr;
    this.data = this.logToolDbService.getLogToolDbDataObj();
    if (this.data) {
      this.data.origin = 'AMO-LOG-TOOL-DATA';
      this.dataExists = true;
      this.exceedsDownloadSizeLimit = this.importExportService.testIsOverLimit(this.data);
      this.isProcessing = false;
    }
    }, 250);
  }

  closeExportData(){
    this.exportModal.hide()
    this.exportModal.onHidden.subscribe(val => {
      this.logToolService.openExportData.next(false);
    });
  }

  exportJson() {
    let stringifyData = JSON.stringify(this.data);
    let doc = this.windowRefService.getDoc();
    let dlLink = doc.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    if (!this.exportName) {
      const date = new Date();
      const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
      this.exportName = 'ExplorerData_' + dateStr;
    }
    dlLink.setAttribute('download', this.exportName + '.json');
    dlLink.click();
    this.closeExportData();

  }

  exportZip() {
    this.isProcessing = true;
    setTimeout(() => {
      let stringifyData = JSON.stringify(this.data);
      let gzip = pako.gzip(stringifyData);
      let blob = new Blob([gzip], { type: 'application/gzip' });
      let url = URL.createObjectURL(blob);
      let dlLink = document.createElement('a');
      dlLink.href = url;
      if (!this.exportName) {
        const date = new Date();
        const dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
        this.exportName = 'ExportedData_' + dateStr;
      }
      dlLink.setAttribute('download', this.exportName + '.gz');
      dlLink.click();
      this.isProcessing = false;
      this.closeExportData();
    }, 1000);
  }



}
