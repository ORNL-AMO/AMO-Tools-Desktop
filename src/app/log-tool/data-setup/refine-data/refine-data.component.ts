import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { ExplorerData, ExplorerDataSet, LogToolField, StepMovement } from '../../log-tool-models';
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
  applyToAll: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private logToolDataService: LogToolDataService,
    private logToolService: LogToolService) { }

  async ngOnInit() {
    this.explorerData = this.logToolDataService.explorerData.getValue();
    if (!this.explorerData.isExample && !this.explorerData.isExistingImport) {
      await this.createDataSetsFromFileData();
    }
    this.setSelectedDataSet(0);
    this.changeStepSub = this.logToolDataService.changeStep.subscribe(changeStep => {
      if (changeStep) {
        let changeStepIndex: number = this.logToolDataService.getNewStepIndex(changeStep, this.selectedDataSetIndex, this.explorerData.datasets.length - 1);
        this.changeStepOrNavigate(changeStep, changeStepIndex);
      }
    });
    this.logToolDataService.loadingSpinner.next({show: false, msg: 'Loading Data...'});
  }


  ngOnDestroy(){
    this.logToolDataService.changeStep.next(undefined);
    this.changeStepSub.unsubscribe();
  }
  
  changeStepOrNavigate(changeStep: StepMovement, changeStepIndex: number) {
    if (changeStepIndex === -1) {
        // is first or last file/dataset
        if (this.explorerData.refineDataStepStatus.isComplete && changeStep.direction == 'forward') {
          this.router.navigateByUrl(changeStep.url);
        }
        if (changeStep.direction == 'back') {
          this.router.navigateByUrl(changeStep.url);
        }
      } else {
        if (changeStep.direction === 'back' || (changeStep.direction === 'forward' && this.explorerData.refineDataStepStatus.currentDatasetValid)) {
          this.setSelectedDataSet(changeStepIndex);
          this.cd.detectChanges();
        }
      }
  }

  async createDataSetsFromFileData() {
    // set spinner spinner incase not set form 'next' click
    this.logToolDataService.loadingSpinner.next({ show: true, msg: 'Loading Data...' });
    await this.logToolDataService.importFileData()
      .then((parsedFilesData) => {
        if (parsedFilesData.some(data => data != undefined)) {
          parsedFilesData.forEach((parsedFileData: CsvImportData) => {
            if (parsedFileData) {
              this.explorerData = this.logToolDataService.addImportDataSet(parsedFileData, parsedFileData.name, parsedFileData.dataSetId, this.explorerData);
            }
          });
          this.logToolDataService.explorerData.next(this.explorerData);
        }
      });
  }


  editUnit(field: LogToolField) {
    this.logToolService.isModalOpen.next(true);
    this.editField = field;
    this.showEditModal = true;
    this.updateExplorerData();
  }

  closeEditModal() {
    this.logToolService.isModalOpen.next(false);
    this.updateExplorerData()
    this.showEditModal = false;
  }

  updateExplorerData() {
    this.explorerData.datasets.map((dataset, index) => {
      if (index === this.selectedDataSetIndex) {
        dataset = this.selectedDataSet;
      } else if (this.applyToAll) {
        this.applySelectionsToAll(dataset)
      }

      dataset.fields.forEach(field => {
        // auto populate choices for day type analysis
        field.useForDayTypeAnalysis = field.useField;
      });
      return dataset;
    });
    this.explorerData.refineDataStepStatus = this.logToolDataService.checkStepRefineDataComplete(this.explorerData.datasets, this.selectedDataSetIndex);
    this.logToolDataService.explorerData.next(this.explorerData);
  }

  applySelectionsToAll(dataSet: ExplorerDataSet) {
    dataSet.refineDataTabVisited = true;
    dataSet.fields.map((field, i) => {
      // Only if fields have same original name
      if (field.fieldName === this.selectedDataSet.fields[i].fieldName) {
        field.alias = this.selectedDataSet.fields[i].alias;
      }
      field.useForDayTypeAnalysis = this.selectedDataSet.fields[i].useField;
      field.useField = this.selectedDataSet.fields[i].useField;
      field.unit = this.selectedDataSet.fields[i].unit;
    })
  }

  setSelectedDataSet(index: number) {
      this.selectedDataSetIndex = index;
      this.selectedDataSet = this.explorerData.datasets[index];
      this.explorerData.datasets[index].refineDataTabVisited = true;
      this.explorerData.refineDataStepStatus = this.logToolDataService.checkStepRefineDataComplete(this.explorerData.datasets, this.selectedDataSetIndex);
      this.logToolDataService.explorerData.next(this.explorerData);
   }

}