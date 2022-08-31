import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import * as XLSX from 'xlsx';
import { ExplorerData, DataExplorerStatus, ExplorerFileData, StepMovement } from '../../log-tool-models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-data-header',
  templateUrl: './select-data-header.component.html',
  styleUrls: ['./select-data-header.component.css']
})
export class SelectDataHeaderComponent implements OnInit {
  explorerData: ExplorerData;
  explorerDataSub: Subscription;
  selectedFileData: ExplorerFileData;
  selectedFileDataSub;
  selectedSheet: string;
  // Preview file data
  previewRowIndicies: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedFileDataIndex: number = 0;
  changeStepSub: Subscription;
  
  constructor(
    private logToolDataService: LogToolDataService, 
    private router: Router,
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
      // out of current step bounds
        // let isStepCompleted: boolean = this.logToolDataService.checkStepSelectedHeaderComplete(this.explorerData.fileData);
        if (this.explorerData.setupCompletion.isStepHeaderRowComplete && changeStep.direction == 'forward') {
          this.router.navigateByUrl(changeStep.url);
        }
        if (changeStep.direction == 'back') {
          this.router.navigateByUrl(changeStep.url);
        }
      } else {
        this.setSelectedFileData(changeStepIndex);
        this.cd.detectChanges();
      }
  }

  setSelectedSheet() {
    let xlsxRows = XLSX.utils.sheet_to_csv(this.selectedFileData.workBook.Sheets[this.selectedSheet], { dateNF: "mm/dd/yyyy hh:mm:ss" });
    this.explorerData.fileData.map(xlsxData => {
      if (xlsxData.id === this.selectedFileData.id) {
        xlsxData.selectedSheet = this.selectedSheet;
        xlsxData.data = xlsxRows;
      }
    });
    this.logToolDataService.explorerData.next(this.explorerData);
  }

      
  setSelectedFileData(index: number) {
    this.selectedFileDataIndex = index;
    this.selectedFileData = this.explorerData.fileData[index];
    if (this.selectedFileData.fileType === '.xlsx') {
      this.selectedSheet = this.selectedFileData.selectedSheet;
    }
    this.explorerData.fileData[index].headerRowVisited = true;
    this.explorerData.setupCompletion.isStepHeaderRowComplete = this.logToolDataService.checkStepSelectedHeaderComplete(this.explorerData.fileData);
    // if steps can become incomeplete, add else 
    if (this.explorerData.setupCompletion.isStepHeaderRowComplete) {
        this.logToolDataService.explorerData.next(this.explorerData);
    }
  }

}
