import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { DayTypeGraphService } from './day-type-graph/day-type-graph.service';
import { DayTypeAverageInterval, ExplorerData, ExplorerDataSet, IndividualDataFromCsv, LoadingSpinner, LogToolField } from '../log-tool-models';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
import { VisualizeService } from '../visualize/visualize.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LogToolService } from '../log-tool.service';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
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
  conflictingIntervalsWarning: string = undefined;
  form: UntypedFormGroup;
  selectedDataSet: ExplorerDataSet;
  selectedDataSetIndex: number = 0;
  applyToAll: boolean = false;

  selectedDataField: LogToolField;
  selectedDataFieldSub: Subscription;

  dayTypeAverageIntervalOptions: Array<DayTypeAverageInterval> = [
    {display: '15 Minute', seconds: 900, unitOfTimeString: 'minutes'},
    {display: '30 Minute', seconds: 1800, unitOfTimeString: 'minutes'},
    {display: 'Hourly', seconds: 3600, unitOfTimeString: 'hour'},
    {display: '24 Hour', seconds: 86400, unitOfTimeString: 'day'},
  ];

  hasSelectedChanges: boolean = false; 

  explorerData: ExplorerData;
  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner = {show: true, msg: 'Finalizing Data Setup...'};
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, 
    private dayTypeGraphService: DayTypeGraphService,
    private cd: ChangeDetectorRef, 
    private logToolService: LogToolService,
    private visualizeService: VisualizeService,
    private logToolDataService: LogToolDataService, 
    private logToolDbService: LogToolDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.initForm();
    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner;
      this.cd.detectChanges();
    });

    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });

    this.displayDayTypeCalanderSub = this.dayTypeAnalysisService.displayDayTypeCalander.subscribe(val => {
      this.displayDayTypeCalander = val;
    });
    this.dataViewSub = this.dayTypeAnalysisService.dataView.subscribe(val => {
      this.dataView = val;
    });
    if (this.dayTypeAnalysisService.selectedDataField.getValue() == undefined) {
      let allFields: Array<LogToolField> = this.visualizeService.getDataFieldOptions(true);
      // Default to show all units/collected data
      this.dayTypeAnalysisService.selectedDataField.next(allFields[allFields.length - 1]);
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
    this.loadingSpinnerSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
  }

  initForm() {
    this.explorerData = this.logToolDataService.explorerData.getValue();
    this.setSelectedDataSet(0);
    this.initDayTypeAverageIntervalForm();
  }

  setSelectedDataSet(index: number) {
    this.selectedDataSetIndex = index;
    this.selectedDataSet = this.explorerData.datasets[index];
 }

  updateExplorerData() {
    this.hasSelectedChanges = true;
    this.explorerData.datasets.map((dataset, index) => {
      if (index === this.selectedDataSetIndex) {
        dataset = this.selectedDataSet;
      } else if (this.applyToAll) {
        this.applySelectionsToDataset(dataset)
      }
      return dataset;
    });
  }

  applySelectionsToDataset(dataSet: ExplorerDataSet) {
    dataSet.refineDataTabVisited = true;
    dataSet.fields.map((field, i) => {
      field.useForDayTypeAnalysis = this.selectedDataSet.fields[i].useForDayTypeAnalysis;
    });
    return dataSet;
  }

  initDayTypeAverageIntervalForm() {
    let defaultHourlyInterval: DayTypeAverageInterval = this.dayTypeAverageIntervalOptions[2];
    if (!this.logToolDataService.selectedDayTypeAverageInterval) {
      this.logToolDataService.selectedDayTypeAverageInterval = defaultHourlyInterval;
    }
    let explorerDatasets: Array<ExplorerDataSet | IndividualDataFromCsv> = this.logToolService.individualDataFromCsv;
    this.checkValidInterval(explorerDatasets[0].dataCollectionInterval, this.logToolDataService.selectedDayTypeAverageInterval.seconds)
    this.form = new UntypedFormGroup({
      dayTypeAverageInterval: new UntypedFormControl(this.logToolDataService.selectedDayTypeAverageInterval.seconds, [Validators.required]),
    });
  }

  changeDayTypeAverageInterval() {
    let explorerDatasets: Array<ExplorerDataSet | IndividualDataFromCsv> = this.logToolService.individualDataFromCsv;
    this.checkValidInterval(explorerDatasets[0].dataCollectionInterval, this.form.controls.dayTypeAverageInterval.value);
    this.logToolDataService.selectedDayTypeAverageInterval = this.dayTypeAverageIntervalOptions.find(interval => interval.seconds === this.form.controls.dayTypeAverageInterval.value);
    this.hasSelectedChanges = true;
  }

  focusField(fieldName: string) {

  }

  checkValidInterval(dataCollectionInterval: number, selectedInterval: number) {
    if (dataCollectionInterval && selectedInterval < dataCollectionInterval) {
      this.conflictingIntervalsWarning = `Selected interval is less than the data collection interval chosen in the 'Map Date and Time' tab`;
    } else {
      this.conflictingIntervalsWarning = undefined;
    }
  }

  // 25 sec for all 3 fujis
  runAnalysis() {
    this.loadingSpinner = {show: true, msg: `Calculating Day Types. This may take a moment
    depending on the amount of data you have supplied.`};
    setTimeout(() => {
      this.analyticsService.sendEvent('run-day-type-analysis');
      this.logToolDataService.setLogToolDays();
      this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
      this.dayTypeAnalysisService.initDayTypes();
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.dayTypeGraphService.setDayTypeScatterPlotData();
      this.dayTypeGraphService.setIndividualDayScatterPlotData();
      this.dayTypeAnalysisService.dayTypesCalculated = true;
      this.hasRunDayTypeAnalysis = true;
      this.loadingSpinner = {show: false}
      this.hasSelectedChanges = false;
      this.cd.detectChanges();
    }, 50)
  }
}
