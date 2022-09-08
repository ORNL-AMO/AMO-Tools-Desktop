import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';
import { DataExplorerStatus, ExplorerData, ExplorerDataSet, ExplorerFileData, LoadingSpinner, LogToolField, StepMovement } from '../../log-tool-models';
import { LogToolService } from '../../log-tool.service';

@Component({
  selector: 'app-refine-data',
  templateUrl: './refine-data.component.html',
  styleUrls: ['./refine-data.component.css']
})
export class RefineDataComponent implements OnInit {
  explorerData: ExplorerData;
  selectedSheet: string;
  editField: LogToolField;
  showEditModal: boolean = false;
  selectedDataSet: ExplorerDataSet;
  selectedDataSetIndex: number = 0;
  previewRowIndicies: Array<number> = [0, 1];
  changeStepSub: Subscription;
  
  constructor(
    private logToolDbService: LogToolDbService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private logToolDataService: LogToolDataService,
    private logToolService: LogToolService) { }

  ngOnInit() {
    this.explorerData = this.logToolDataService.explorerData.getValue();

    let isFileDataImported: boolean = this.explorerData.datasets.length !== 0;
    if (!isFileDataImported) {
      this.parseFileDataAndSave();
    }
    this.setSelectedDataSet(0);
    this.changeStepSub = this.logToolDataService.changeStep.subscribe(changeStep => {
      if (changeStep) {
        let changeStepIndex: number = this.logToolDataService.getNewStepIndex(changeStep, this.selectedDataSetIndex, this.explorerData.datasets.length - 1);
        this.changeStepOrNavigate(changeStep, changeStepIndex);
      }
    });
    setTimeout(() => {
      this.logToolDataService.loadingSpinner.next({show: false, msg: 'Loading Data...'});
    }, 300);
  }
  
  parseFileDataAndSave() {
    this.logToolDataService.importFileData();
    this.logToolDbService.saveData();
    this.explorerData = this.logToolDataService.explorerData.getValue();
  }

  ngOnDestroy(){
    this.logToolDataService.changeStep.next(undefined);
    this.changeStepSub.unsubscribe();
  }
  
  changeStepOrNavigate(changeStep: StepMovement, changeStepIndex: number) {
    if (changeStepIndex === -1) {
      // out of current step bounds
        if (this.explorerData.setupCompletion.isStepRefineComplete && changeStep.direction == 'forward') {
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


  editUnit(field: LogToolField) {
    this.logToolService.isModalOpen.next(true);
    this.editField = field;
    this.showEditModal = true;
    this.updateExplorerData();
  }

  closeEditModal() {
    this.logToolService.isModalOpen.next(false);
    this.showEditModal = false;
  }

  setUseField(index: number) {
    this.updateExplorerData();
  }

  updateFieldName(field, index: number) {
    this.updateExplorerData();
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
    this.explorerData.datasets[index].refineDataTabVisited = true;
    this.explorerData.setupCompletion.isStepRefineComplete = this.logToolDataService.checkStepRefineDataComplete(this.explorerData.datasets);
    if (this.explorerData.setupCompletion.isStepRefineComplete) {
      this.logToolDataService.explorerData.next(this.explorerData);
    }
  }
  


}