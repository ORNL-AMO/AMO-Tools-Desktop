import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { DayTypeGraphService } from './day-type-graph/day-type-graph.service';
import { LoadingSpinner, LogToolField } from '../log-tool-models';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
import { VisualizeService } from '../visualize/visualize.service';
@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  displayDayTypeCalanderSub: Subscription;
  displayDayTypeCalander: boolean;
  hasRunDayTypeAnalysis: boolean = false;
  canUpdateDayTypeAnalysis: boolean = false;
  dataViewSub: Subscription;
  dataView: string;

  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner = {show: true, msg: 'Finalizing Data Setup...'};
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, 
    private dayTypeGraphService: DayTypeGraphService,
    private cd: ChangeDetectorRef, 
    private visualizeService: VisualizeService,
    private logToolDataService: LogToolDataService, 
    private logToolDbService: LogToolDbService) { }

  ngOnInit() {
    // this.checkCanUpdateDayTypeAnlysis();
    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner;
      this.cd.detectChanges();
    });

    this.displayDayTypeCalanderSub = this.dayTypeAnalysisService.displayDayTypeCalander.subscribe(val => {
      this.displayDayTypeCalander = val;
    });
    this.dataViewSub = this.dayTypeAnalysisService.dataView.subscribe(val => {
      this.dataView = val;
    });
    if (this.dayTypeAnalysisService.selectedDataField.getValue() == undefined) {
      let allFields: Array<LogToolField> = this.visualizeService.getDataFieldOptions();
      this.dayTypeAnalysisService.selectedDataField.next(allFields[0]);
    }
    this.hasRunDayTypeAnalysis = this.dayTypeAnalysisService.dayTypesCalculated == true;
    setTimeout(() => {
      this.loadingSpinner = {show: false};
      this.logToolDataService.loadingSpinner.next({show: false, msg: 'Finalizing Data Setup...'});
    }, 200);
  }

  ngOnDestroy() {
    this.displayDayTypeCalanderSub.unsubscribe();
    this.dataViewSub.unsubscribe();
    this.logToolDbService.saveData();
    this.loadingSpinnerSub.unsubscribe();
  }

  // checkCanUpdateDayTypeAnlysis() {
  //   if (this.logToolDataService.checkHasUnprocessedFileData()) {
  //     this.canUpdateDayTypeAnalysis = true;
  //     console.log('canUpdate', this.canUpdateDayTypeAnalysis);
  //   }
  // }
  runAnalysis() {
    this.loadingSpinner = {show: true, msg: `Calculating Day Types. This may take a moment
    depending on the amount of data you have supplied.`};
    setTimeout(() => {
      this.logToolDataService.setLogToolDays();
      this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
      this.dayTypeAnalysisService.initDayTypes();
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.dayTypeGraphService.setDayTypeScatterPlotData();
      this.dayTypeGraphService.setIndividualDayScatterPlotData();
      this.dayTypeAnalysisService.dayTypesCalculated = true;
      this.hasRunDayTypeAnalysis = true;
      this.loadingSpinner = {show: false}
      this.cd.detectChanges();
    }, 50)
  }
}
