import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import * as XLSX from 'xlsx';
import { ExplorerData, ExplorerFileData, StepMovement } from '../../log-tool-models';
import { Router } from '@angular/router';
import { CsvImportData, CsvToJsonService } from '../../../shared/helper-services/csv-to-json.service';

@Component({
  selector: 'app-select-data-header',
  templateUrl: './select-data-header.component.html',
  styleUrls: ['./select-data-header.component.css']
})
export class SelectDataHeaderComponent implements OnInit {
  explorerData: ExplorerData;
  explorerDataSub: Subscription;
  selectedFileData: ExplorerFileData;
  selectedSheet: string;
  // Preview file data
  previewRowIndicies: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedFileDataIndex: number = 0;
  changeStepSub: Subscription;
  applyToAll: boolean = false;
  
  constructor(
    private logToolDataService: LogToolDataService, 
    private router: Router,
    private csvToJsonService: CsvToJsonService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.explorerData = this.logToolDataService.explorerData.getValue();
    this.setSelectedFileData(0);

    this.changeStepSub = this.logToolDataService.changeStep.subscribe(changeStep => {
      if (changeStep) {
        let changeStepIndex: number = this.logToolDataService.getNewStepIndex(changeStep, this.selectedFileDataIndex, this.explorerData.fileData.length - 1);
        this.changeStepOrNavigate(changeStep, changeStepIndex);
      }
    });
  }

  ngOnDestroy(){
    this.logToolDataService.changeStep.next(undefined);
    this.changeStepSub.unsubscribe();
  }

  changeStepOrNavigate(changeStep: StepMovement, changeStepIndex: number) {
    if (changeStepIndex === -1) {
      // is first or last file/dataset
      if (this.explorerData.isStepHeaderRowComplete && changeStep.direction == 'forward') {
        this.logToolDataService.loadingSpinner.next({ show: true, msg: 'Loading Data...' });
        // set delay to display spinner before blocked thread thread
        setTimeout(async () => {
          this.router.navigateByUrl(changeStep.url);
        }, 25);
      }
      if (changeStep.direction == 'back') {
        this.router.navigateByUrl(changeStep.url);
      }
    } else {
      this.setSelectedFileData(changeStepIndex);
      this.cd.detectChanges();
    }
  }

  async setSelectedSheet() {
    let xlsxRows = XLSX.utils.sheet_to_csv(this.selectedFileData.workBook.Sheets[this.selectedSheet], { dateNF: "mm/dd/yyyy hh:mm:ss" });
    this.selectedFileData.selectedSheet = this.selectedSheet;
    this.selectedFileData.data = xlsxRows;
    let fileParsedResults: CsvImportData = await this.csvToJsonService.parseCsvWithoutHeaders(xlsxRows);
    this.selectedFileData.previewData = fileParsedResults.data;

    this.explorerData.fileData.map(xlsxData => {
      if (xlsxData.dataSetId === this.selectedFileData.dataSetId) {
        xlsxData = this.selectedFileData;
      }
    });
    this.logToolDataService.explorerData.next(this.explorerData);
  }

  updateHeaderRowIndex() {
    if (this.applyToAll && this.selectedFileData.headerRowIndex !== undefined) {
      this.explorerData.fileData.map(fileData => {
        fileData.headerRowIndex = this.selectedFileData.headerRowIndex;
        fileData.headerRowVisited = true;
      });
      this.updateCompletionStatus();
    }
  }

      
  setSelectedFileData(index: number) {
    this.selectedFileDataIndex = index;
    this.selectedFileData = this.explorerData.fileData[index];
    if (this.selectedFileData.fileType === '.xlsx') {
      this.selectedSheet = this.selectedFileData.selectedSheet;
    }
    this.explorerData.fileData[index].headerRowVisited = true;
    this.updateCompletionStatus();
  }

  updateCompletionStatus() {
    this.explorerData.isStepHeaderRowComplete = this.logToolDataService.checkStepSelectedHeaderComplete(this.explorerData.fileData);
    if (this.explorerData.isStepHeaderRowComplete) {
        this.logToolDataService.explorerData.next(this.explorerData);
    }
  }

}
