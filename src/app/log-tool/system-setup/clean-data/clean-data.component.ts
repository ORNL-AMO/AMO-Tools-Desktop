import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolField } from '../../log-tool-models';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { DayTypeGraphService } from '../../day-type-analysis/day-type-graph/day-type-graph.service';
import { Router } from '@angular/router';

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
  dataExists: boolean = false;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService, private cd: ChangeDetectorRef,
    private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService, private dayTypeGraphService: DayTypeGraphService,
    private router: Router) { }

  ngOnInit() {
    this.startDate = this.logToolService.startDate;
    this.endDate = this.logToolService.endDate;
    this.dataFields = this.logToolService.fields;
    this.numberOfDataPoints = this.logToolService.numberOfDataPoints;
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
  }


  submit() {
    this.cleaningData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.logToolDataService.setLogToolDays();
      this.logToolDataService.setValidNumberOfDayDataPoints();
      this.logToolService.dataCleaned.next(true);
      this.cleaningData = false;
      this.dataSubmitted = true;
    }, 500)
  }

  
  resetData(){
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    this.logToolService.resetData();
    this.logToolDataService.resetData();
    this.router.navigateByUrl('/log-tool/system-setup/setup-data');
  }
}
