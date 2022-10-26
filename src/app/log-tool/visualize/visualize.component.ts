import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
import { GraphObj, LoadingSpinner } from '../log-tool-models';
import { VisualizeMenuService } from './visualize-menu/visualize-menu.service';
import { VisualizeService } from './visualize.service';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})
export class VisualizeComponent implements OnInit {

  tabSelect: string = 'results';
  constructor(private logToolDataService: LogToolDataService, 
    private visualizeMenuService: VisualizeMenuService,
    private logToolDbService: LogToolDbService,
    private visualizeService: VisualizeService) { }

  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner;
  ngOnInit() {
    this.logToolDataService.loadingSpinner.next({show: false, msg: undefined});
    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner;
    });

    this.visualizeService.visualizeDataInitialized = true;
    this.visualizeService.visualizeData = new Array();
    let dataFields = this.logToolDataService.getDataFieldOptionsWithDate();
    dataFields.forEach(field => {
      let data = this.logToolDataService.getAllFieldData(field.fieldName);
      this.visualizeService.visualizeData.push({
        data: data,
        dataField: field
      });
    });

    this.setInitialGraphData();
  }

  ngOnDestroy() {
    this.saveUserOptionsChanges() 
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setInitialGraphData() {
    let initialGraphObj: GraphObj = this.visualizeService.selectedGraphObj.getValue();
    if (initialGraphObj.data[0].type == 'bar') {
      if (initialGraphObj.binnedField == undefined || initialGraphObj.binnedField.fieldName != initialGraphObj.selectedXAxisDataOption.dataField.fieldName || initialGraphObj.bins == undefined) {
        initialGraphObj = this.visualizeMenuService.initializeBinData(initialGraphObj);
      }
    }
    this.visualizeMenuService.setGraphType(initialGraphObj);
  }

  saveUserOptionsChanges() {
    let selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    let userGraphObj = this.visualizeService.userGraphOptions.getValue();
    if (selectedGraphObj && userGraphObj) {
      selectedGraphObj.graphInteractivity = userGraphObj.graphInteractivity;
      selectedGraphObj.layout = userGraphObj.layout;
      this.visualizeService.selectedGraphObj.next(selectedGraphObj);
      this.logToolDbService.saveData();
    }
  }
}
