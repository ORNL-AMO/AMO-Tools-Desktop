import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolField } from '../../log-tool-models';

@Component({
  selector: 'app-clean-data',
  templateUrl: './clean-data.component.html',
  styleUrls: ['./clean-data.component.css']
})
export class CleanDataComponent implements OnInit {

  startDate: Date;
  endDate: Date;
  dataFields: Array<LogToolField>;
  numberOfDataPoints: number;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.startDate = this.logToolService.startDate;
    this.endDate = this.logToolService.endDate;
    this.dataFields = this.logToolService.fields;
    this.numberOfDataPoints = this.logToolService.numberOfDataPoints;
  }


  submit() {
    this.logToolDataService.setLogToolDays();
    this.logToolDataService.setValidNumberOfDayDataPoints();
    this.logToolService.dataSubmitted.next(true);
  }
}
