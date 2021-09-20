import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { DayTypeAnalysisService } from '../day-type-analysis/day-type-analysis.service';
import { DayTypeGraphService } from '../day-type-analysis/day-type-graph/day-type-graph.service';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
import { LogToolDbData } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';
import { VisualizeService } from '../visualize/visualize.service';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.css']
})
export class ExportModalComponent implements OnInit {
  
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;


  exportData: boolean = false;
  dataExists: boolean = false;
  dataAvailableSub: Subscription;
  dataAvailable: Date;
  data: LogToolDbData;
  exportName: string;
  constructor(private logToolService: LogToolService, private logToolDbService: LogToolDbService, 
    private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService, private dayTypeGraphService: DayTypeGraphService,
    private logToolDataService: LogToolDataService, private windowRefService: WindowRefService) { }

  ngOnInit(){
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
  ngOnDestroy() {
    if (this.dataAvailableSub) {
      this.dataAvailableSub.unsubscribe();
    }
  }

  getExportData(){
    this.exportData = true;
    this.dataAvailableSub = this.logToolDbService.previousDataAvailable.subscribe(val => {
      this.dataAvailable = val;
    });
    this.logToolDbService.setLogToolData();
    //this.dataAvailable = undefined;
    // if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
    //   this.dataExists = true;
    // }
    this.data = this.logToolDbService.getSavedData();
    if(this.data){
      this.dataExists = true;
    }
    // if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
    //   this.dataExists = true;
    // }
    // if (this.dataExists == false && this.logToolService.dataSubmitted.getValue() == false) {
    //   this.dataAvailableSub = this.logToolDbService.previousDataAvailable.subscribe(val => {
    //     this.dataAvailable = val;
    //   });
    // }
  }

  buildExportJSON() {
    this.downloadData(this.data, this.exportName);
    this.closeExportData();
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
    dlLink.click();
  }

}
