import { Component, OnInit } from '@angular/core';
import { LogToolDataService } from '../log-tool-data.service';
import { VisualizeService } from './visualize.service';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})
export class VisualizeComponent implements OnInit {

  tabSelect: string = 'results';
  constructor(private logToolDataService: LogToolDataService, private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.logToolDataService.loadingSpinner.next({show: false, msg: undefined});
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
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
