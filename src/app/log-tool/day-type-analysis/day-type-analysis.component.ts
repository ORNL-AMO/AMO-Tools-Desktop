import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { filter, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { DayTypeGraphService } from './day-type-graph/day-type-graph.service';
import { LoadingSpinner, LogToolField } from '../log-tool-models';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  showContent: boolean = false;
  displayDayTypeCalanderSub: Subscription;
  displayDayTypeCalander: boolean;
  dataViewSub: Subscription;
  dataView: string;
  calculatingData: boolean = false;

  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner = {show: true, msg: 'Finalizing Data Setup...'};
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, 
    private dayTypeGraphService: DayTypeGraphService,
    private activatedRoute: ActivatedRoute, 
    private router: Router,
    private cd: ChangeDetectorRef, 
    private logToolDataService: LogToolDataService, 
    private logToolDbService: LogToolDbService) { }

  ngOnInit() {
    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner
      this.cd.detectChanges();
    });

    this.displayDayTypeCalanderSub = this.dayTypeAnalysisService.displayDayTypeCalander.subscribe(val => {
      this.displayDayTypeCalander = val;
    });
    this.dataViewSub = this.dayTypeAnalysisService.dataView.subscribe(val => {
      this.dataView = val;
    });
    if (this.dayTypeAnalysisService.selectedDataField.getValue() == undefined) {
      let allFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
      this.dayTypeAnalysisService.selectedDataField.next(allFields[0]);
    }
    if (this.dayTypeAnalysisService.dayTypesCalculated == true) {
      this.showContent = true;
      this.cd.detectChanges();
    }

    setTimeout(() => {
      this.loadingSpinner = {show: false};
      this.logToolDataService.loadingSpinner.next({show: false, msg: 'Finalizing Data Setup...'});
    }, 200);

  }

  ngOnDestroy() {
    this.displayDayTypeCalanderSub.unsubscribe();
    this.dataViewSub.unsubscribe();
    this.logToolDbService.saveData();
  }

  runAnalysis() {
    this.calculatingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      // console.time('runAnalysis');
      this.logToolDataService.setLogToolDays();
      this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
      this.dayTypeAnalysisService.initDayTypes();
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.dayTypeGraphService.setDayTypeScatterPlotData();
      this.dayTypeGraphService.setIndividualDayScatterPlotData();
      // console.timeEnd('runAnalysis');
      this.showContent = true;
      this.dayTypeAnalysisService.dayTypesCalculated = true;
      this.calculatingData = false;
      this.cd.detectChanges();
    }, 50)
  }
}
