import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';
import { ExplorerData, ExplorerDataSet, StepMovement } from '../../log-tool-models';
import { LogToolService } from '../../log-tool.service';

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
  secondsIntervalOptions: Array<number> = [ undefined, 1, 2, 3, 4, 5, 15, 20, 30 ];

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
            let nextURL: string = changeStep.url;
            if (!this.explorerData.canRunDayTypeAnalysis) {
              nextURL = '/log-tool/visualize';
            } 
            this.router.navigateByUrl(nextURL);
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
    await this.logToolDbService.saveData();
    this.logToolDataService.explorerData.next(this.explorerData);
  }

  updateExplorerData() {
    this.explorerData.datasets.map((dataset, index) => {
      if (index === this.selectedDataSetIndex) {
        dataset = this.selectedDataSet;
      } else if (this.applyToAll) {
        dataset = this.applyDateFieldToAll(dataset);
        dataset = this.applyTimeFieldToAll(dataset);
      }
      return dataset;
    });
    this.logToolDataService.explorerData.next(this.explorerData);
  }

  applyDateFieldToAll(dataSet: ExplorerDataSet) {
    let selectedDateFieldName: string = this.selectedDataSet.fields.find(field => field.isDateField === true)?.fieldName;
    dataSet.fields.map(field => field.isDateField = selectedDateFieldName === field.fieldName);
    dataSet.hasDateField = selectedDateFieldName != undefined;
    dataSet.intervalForSeconds = this.selectedDataSet.intervalForSeconds;
    return dataSet;
  }

  applyTimeFieldToAll(dataSet: ExplorerDataSet) {
    let selectedTimeFieldName: string = this.selectedDataSet.fields.find(field => field.isTimeField === true)?.fieldName;
    dataSet.fields.map(field => field.isTimeField = selectedTimeFieldName === field.fieldName);
    dataSet.hasTimeField = selectedTimeFieldName != undefined;
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
      dataSet.intervalForSeconds = undefined;
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
  setSecondsInterval() {
    this.updateExplorerData();
  }

}