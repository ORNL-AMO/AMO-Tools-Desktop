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
  isStepCompleted: boolean = false;
  explorerData: ExplorerData;
  // Preview file data
  previewData: Array<any>;
  selectedDataSet: ExplorerDataSet;
  selectedDataSetIndex: number = 0;
  changeStepSub: Subscription;
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
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
    this.changeStepSub.unsubscribe();
  }

  changeStepOrNavigate(changeStep: StepMovement, changeStepIndex: number) {
    if (changeStepIndex === -1) {
      // out of current step bounds
        if (this.explorerData.setupCompletion.isStepMapTimeDataComplete && changeStep.direction == 'forward') {
          this.router.navigateByUrl(changeStep.url);
        }
        if (changeStep.direction == 'back') {
          this.router.navigateByUrl(changeStep.url);
        }
      } else {
        this.setSelectedDataSet(changeStepIndex);
        this.cd.detectChanges();
      }
  }

  
  setDateField(explorerDataSet: ExplorerDataSet) {
    this.selectedDataSet.dateField = explorerDataSet.fields.find(field => {
      return field.isDateField == true;
    });
    this.selectedDataSet.hasDateField = this.selectedDataSet.dateField != undefined;
    this.updateExplorerData();
    this.cd.detectChanges();
  }

  setTimeField(explorerDataSet: ExplorerDataSet) {
    explorerDataSet.timeField = explorerDataSet.fields.find(field => {
      return field.isTimeField == true;
    });
    explorerDataSet.hasTimeField = explorerDataSet.timeField != undefined;
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
    this.updateExplorerData();
    this.cd.detectChanges();
  }
  

  updateExplorerData() {
    this.explorerData.datasets.map((dataset, index) => {
      if (index === this.selectedDataSetIndex) {
        dataset = this.selectedDataSet;
      }
      return dataset;
    });
    this.logToolDataService.explorerData.next(this.explorerData);
  }

  
  setSelectedDataSet(index: number) {
    this.selectedDataSetIndex = index;
    this.selectedDataSet = this.explorerData.datasets[index];
    this.explorerData.datasets[index].mapTimeDataTabVisited = true;
    this.explorerData.setupCompletion.isStepMapTimeDataComplete = this.logToolDataService.checkStepMapDatesComplete(this.explorerData.datasets);
    // if steps can become incomeplete, add else 
    if (this.explorerData.setupCompletion.isStepMapTimeDataComplete) {
      this.logToolDataService.explorerData.next(this.explorerData);
    }
  }


}