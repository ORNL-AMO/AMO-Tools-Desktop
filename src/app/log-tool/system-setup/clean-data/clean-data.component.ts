import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  cleaningData: boolean = false;
  dataSubmitted: boolean = false;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.startDate = this.logToolService.startDate;
    this.endDate = this.logToolService.endDate;
    this.dataFields = this.logToolService.fields;
    this.numberOfDataPoints = this.logToolService.numberOfDataPoints;
  }


  submit() {
    this.cleaningData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.logToolDataService.setLogToolDays();
      this.logToolDataService.setValidNumberOfDayDataPoints();
      this.logToolService.dataSubmitted.next(true);
      this.cleaningData = false;
      this.dataSubmitted = true;
    }, 500)
  }
}
