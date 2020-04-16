import { Component, OnInit } from '@angular/core';
import { LogToolDataService } from '../log-tool-data.service';
import { VisualizeService } from './visualize.service';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})
export class VisualizeComponent implements OnInit {

  constructor(private logToolDataService: LogToolDataService, private visualizeService: VisualizeService) { }

  ngOnInit() {
    console.log('init');
    console.time('init');
    this.visualizeService.visualizeData = new Array();
    let dataFields = this.logToolDataService.getDataFieldOptionsWithDate();
    // this.xAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.logToolDataService.getAllFieldData(field.fieldName);
      this.visualizeService.visualizeData.push({
        data: data,
        dataField: field
      });
    });
    console.timeEnd('init');
  }

}
