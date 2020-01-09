import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../../log-tool.service';

@Component({
  selector: 'app-clean-data',
  templateUrl: './clean-data.component.html',
  styleUrls: ['./clean-data.component.css']
})
export class CleanDataComponent implements OnInit {

  startDate: Date;
  endDate: Date;
  dataFields: Array<{ fieldName: string, alias: string, useField: boolean, isDateField: boolean }>;
  numberOfDataPoints: number;
  constructor(private logToolService: LogToolService) { }

  ngOnInit() {
    this.startDate = this.logToolService.startDate;
    this.endDate = this.logToolService.endDate;
    this.dataFields = this.logToolService.fields;
    this.numberOfDataPoints = this.logToolService.numberOfDataPoints;
  }

}
