import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';
import { ExplorerData, ExplorerDataSet, StepMovement } from '../../log-tool-models';

@Component({
  selector: 'app-map-time-data',
  templateUrl: './map-time-data.component.html',
  styleUrls: ['./map-time-data.component.css']
})
export class MapTimeDataComponent implements OnInit {
  explorerData: ExplorerData;
  // Preview file data
  selectedDataSet: ExplorerDataSet;
  selectedDataSetIndex: number = 0;
  changeStepSub: Subscription;
  applyToAll: boolean = false;
  dataCollectionIntervalOptions: Array<{display: string, value: number}> = [ 
    {display: '1 seconds', value: 1}, 
    {display: '2 seconds', value: 2}, 
    {display: '3 seconds', value: 3}, 
    {display: '4 seconds', value: 4}, 
    {display: '5 seconds', value: 5}, 
    {display: '15 seconds', value: 15}, 
    {display: '20 seconds', value: 20}, 
    {display: '30 seconds', value: 30}, 
    {display: '15 minute', value: 900}, 
    {display: '30 minute', value: 1800}, 
    {display: 'Hourly', value: 3600},
    {display: '24 Hour', value: 86400}, 
  ];

  toolTipHoldTimeout;
  showTooltipHover: boolean = false;
  showTooltipClick: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.explorerData = this.logToolDataService.explorerData.getValue();
    this.setSelectedDataSet(0);

    this.changeStepSub = this.logToolDataService.changeStep.subscribe(changeStep => {
      if (changeStep) {
        let changeStepIndex: number = this.logToolDataService.getNewStepIndex(changeStep, this.selectedDataSetIndex, this.explorerData.datasets.length - 1);
        this.changeStepOrNavigate(changeStep, changeStepIndex);
      }
    });
  }
  
  ngOnDestroy(){
    this.logToolDataService.changeStep.next(undefined);
    this.changeStepSub.unsubscribe();
  }

 async changeStepOrNavigate(changeStep: StepMovement, changeStepIndex: number) {
    if (changeStepIndex === -1) {
      // is first or last file/dataset
        if (this.explorerData.isStepMapTimeDataComplete && changeStep.direction == 'forward') {
          this.logToolDataService.loadingSpinner.next({show: true, msg: 'Finalizing Data Setup...'});
          // set delay to display spinner before blocked thread thread
          setTimeout(async () => {
            await this.finalizeDataSetup();
            if (this.explorerData.valid.isValid) {
              let nextURL: string = changeStep.url;
              if (!this.explorerData.canRunDayTypeAnalysis) {
                nextURL = '/log-tool/visualize';
              } 
              this.router.navigateByUrl(nextURL);
            }
          }, 25);
        }
        if (changeStep.direction == 'back') {
          this.router.navigateByUrl(changeStep.url);
        }
      } else {
        this.setSelectedDataSet(changeStepIndex);
        this.cd.detectChanges();
      }
  }

  setSelectedDataSet(index: number) {
    this.selectedDataSetIndex = index;
    this.selectedDataSet = this.explorerData.datasets[index];
    this.explorerData.datasets[index].mapTimeDataTabVisited = true;
    this.explorerData.isStepMapTimeDataComplete = this.logToolDataService.checkStepMapDatesComplete(this.explorerData.datasets);
    if (this.explorerData.isStepMapTimeDataComplete) {
      this.logToolDataService.explorerData.next(this.explorerData);
    }
  }
  async finalizeDataSetup() {
    this.explorerData = this.logToolDataService.finalizeDataSetup(this.explorerData);
    if (this.explorerData.valid.isValid) {
      await this.logToolDbService.saveData();
      this.logToolDataService.explorerData.next(this.explorerData);
    } else {
      this.logToolDataService.loadingSpinner.next({show: false});
      this.logToolDataService.errorMessageData.next({
        show: true, 
        msg: this.explorerData.valid.message, 
        detailHTML: this.explorerData.valid.detailHTML,
        objectRefs: this.explorerData.valid.invalidDatasets,
        dismissButtonText: 'Return to Setup'
      });
    }
  }

  updateExplorerData() {
    this.explorerData.datasets.map((dataset, index) => {
      if (index === this.selectedDataSetIndex) {
        dataset = this.selectedDataSet;
      } else if (this.applyToAll) {
        dataset.mapTimeDataTabVisited = true;
        dataset = this.applyDateFieldToAll(dataset);
        dataset = this.applyTimeFieldToAll(dataset);
      }
      return dataset;
    });

    if (this.applyToAll) {
      this.explorerData.isStepMapTimeDataComplete = this.logToolDataService.checkStepMapDatesComplete(this.explorerData.datasets);
    }
    this.logToolDataService.explorerData.next(this.explorerData);
  }

  applyDateFieldToAll(dataSet: ExplorerDataSet) {
    let selectedDataSetDateFieldName: string = this.selectedDataSet.fields.find(field => field.isDateField === true)?.fieldName;
        // keep csvId field id and name from current data set fields
    dataSet.dateField = dataSet.fields.find(field => field.fieldName === selectedDataSetDateFieldName);
    dataSet.fields.map(field => field.isDateField = selectedDataSetDateFieldName === field.fieldName);
    dataSet.hasDateField = dataSet.dateField != undefined;
    dataSet.dataCollectionInterval = this.selectedDataSet.dataCollectionInterval;
    return dataSet;
  }

  applyTimeFieldToAll(dataSet: ExplorerDataSet) {
    let selectedDataSetTimeFieldName: string = this.selectedDataSet.fields.find(field => field.isTimeField === true)?.fieldName;
    // keep csvId field id and name from current data set fields
    dataSet.timeField = dataSet.fields.find(field => field.fieldName === selectedDataSetTimeFieldName);
    dataSet.fields.map(field => field.isTimeField = selectedDataSetTimeFieldName === field.fieldName);
    dataSet.hasTimeField = dataSet.timeField != undefined;
    return dataSet;
  }

  updateDateField() {
    this.selectedDataSet = this.setDateField(this.selectedDataSet);
    this.updateExplorerData();
    this.cd.detectChanges();
  }

  updateTimeField() {
    this.selectedDataSet = this.setTimeField(this.selectedDataSet);
    this.updateExplorerData();
    this.cd.detectChanges();
  }

  setDateField(dataSet: ExplorerDataSet) {
    dataSet.dateField = dataSet.fields.find(field => field.isDateField)
    if (dataSet.dateField) {
      dataSet.hasDateField = true;
    } else {
      dataSet.dataCollectionInterval = undefined;
      dataSet.hasDateField = false;
    }
    return dataSet;
  }

  setTimeField(dataSet: ExplorerDataSet) {
    this.selectedDataSet.timeField = this.selectedDataSet.fields.find(field => {
      return field.isTimeField == true;
    });
    this.selectedDataSet.hasTimeField = this.selectedDataSet.timeField != undefined;

    //this split causing issues for "2:19:00 PM" ending up "PM"
    //removing for issue-5574 but leaving if we find out data that drove this decision
    // csvData.csvImportData.data.map(dataItem => {
    //   if (dataItem[csvData.timeField.fieldName]) {
    //     let splitTime = dataItem[csvData.timeField.fieldName].toString().split(" ");
    //     if (splitTime.length > 1) {
    //       dataItem[csvData.timeField.fieldName] = splitTime[1];
    //     }
    //   }
    // });
  return dataSet;
}

hideTooltipHover() {
  // Allow user to hover on tip text
  this.toolTipHoldTimeout = setTimeout(() => {
    this.showTooltipHover = false;
  }, 200)
}

displayTooltipHover(hoverOnInfo: boolean = false) {
  if (hoverOnInfo) {
    clearTimeout(this.toolTipHoldTimeout);
  }
  this.showTooltipHover = true;
}

toggleClickTooltip(){
  this.showTooltipClick = !this.showTooltipClick;
}

setDataCollectionInterval() {
    this.updateExplorerData();
  }

}