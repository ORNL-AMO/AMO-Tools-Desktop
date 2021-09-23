import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { LogToolDbService } from '../log-tool-db.service';
import { LogToolDbData } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.css']
})
export class ExportModalComponent implements OnInit {
  
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;
  
  buildingExport: boolean = false;
  dataExists: boolean = false;
  data: LogToolDbData;
  exportName: string;
  constructor(private logToolService: LogToolService, private logToolDbService: LogToolDbService, private windowRefService: WindowRefService) { }

  ngOnInit(){
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
    this.logToolDbService.setLogToolData();
   
    this.data = this.logToolDbService.getSavedData();
    if(this.data){
      this.dataExists = true;
    }
  }

  buildExportJSON() {    
    this.buildingExport = true;
    //this.closeExportData();
    this.downloadData(this.data, this.exportName);    
  }

  downloadData(data: any, name: string) {
    //this.buildingExport = true;
    data.origin = 'AMO-LOG-TOOL-DATA';
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
    dlLink.click();
    this.buildingExport = false;
    this.closeExportData();
  }

}
