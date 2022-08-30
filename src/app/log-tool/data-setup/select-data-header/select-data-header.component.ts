import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import * as XLSX from 'xlsx';
import { ExplorerData, DataExplorerStatus, ExplorerFileData } from '../../log-tool-models';

@Component({
  selector: 'app-select-data-header',
  templateUrl: './select-data-header.component.html',
  styleUrls: ['./select-data-header.component.css']
})
export class SelectDataHeaderComponent implements OnInit {
  explorerData: ExplorerData;
  explorerDataSub: Subscription;
  status: DataExplorerStatus;
  explorerStatusSub: Subscription;
  selectedFileData: ExplorerFileData;
  selectedFileDataSub;
  selectedSheet: string;
  // Preview file data
  previewData: Array<any>;
  previewRowIndicies: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedHeaderRow = "0";
  selectedFileDataIndex: number;
  selectedFileDataIndexSub: Subscription;
  
  constructor(
    private logToolDataService: LogToolDataService, 
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.explorerData = this.logToolDataService.explorerData.getValue();
    this.logToolDataService.selectedFileDataIndex.next(0);

    this.explorerStatusSub = this.logToolDataService.status.subscribe(status => {
      this.status = status;
    });

    this.selectedFileDataIndexSub = this.logToolDataService.selectedFileDataIndex.subscribe(index => {
      this.selectedFileDataIndex = index;
      this.setSelectedFileData(index);
      this.cd.detectChanges();
    });

  }
    
    ngOnDestroy(){
      this.selectedFileDataIndexSub.unsubscribe();
      this.explorerStatusSub.unsubscribe();
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

  setSelectedFileDataIndex(index: number) {
    this.logToolDataService.selectedFileDataIndex.next(index);
  }
      
  setSelectedFileData(index: number) {
    this.selectedFileData = this.explorerData.fileData[index];
    if (this.selectedFileData.fileType === '.xlsx') {
      this.selectedSheet = this.selectedFileData.selectedSheet;
    }
    this.explorerData.fileData[index].headerRowVisited = true;
    this.checkStepIsCompleted();
  }
  
  checkStepIsCompleted() {
    let isStepCompleted: boolean = this.logToolDataService.checkStepSelectedHeaderComplete(this.explorerData.fileData);
    if (isStepCompleted) {
      // enable next button
      this.logToolDataService.explorerData.next(this.explorerData);
    }
  }

}
