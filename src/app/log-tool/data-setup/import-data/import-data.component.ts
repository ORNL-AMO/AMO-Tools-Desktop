import { Component, OnInit } from '@angular/core';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';
import * as XLSX from 'xlsx';
import { DataExplorerStatus, ExplorerData, LogToolDbData } from '../../log-tool-models';
import { CsvImportData, CsvToJsonService } from '../../../shared/helper-services/csv-to-json.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css']
})
export class ImportDataComponent implements OnInit {
  displayTimeDetails: boolean;
  invalidFileReferences: Array<any>;
  status: DataExplorerStatus;
  explorerStatusSub: Subscription;
  explorerData: ExplorerData;
  explorerDataSub: Subscription;
  constructor(
    private logToolDataService: LogToolDataService,
    private csvToJsonService: CsvToJsonService,
    private logToolDbService: LogToolDbService) { }

  ngOnInit(): void {
    this.explorerStatusSub = this.logToolDataService.status.subscribe(status => {
      this.status = status;
    });

    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      this.explorerData = data;
    });
  }

  ngOnDestroy() {
    this.explorerStatusSub.unsubscribe();
    this.explorerDataSub.unsubscribe();
  }

  toggleTimeDetails() {
    this.displayTimeDetails = !this.displayTimeDetails;
  }

  finishUpload() {
    this.explorerData.setupCompletion.isStepFileUploadComplete = this.explorerData.fileData.length !== 0;
    this.status.showLoadingSpinner = false;
    this.logToolDataService.status.next(this.status);
    this.logToolDataService.explorerData.next(this.explorerData);
  }
  
  setImportFiles(files: FileList) {
    this.logToolDataService.setLoadingSpinner(true, 'Uploading File Data')
    if (files) {
      this.invalidFileReferences = new Array();
      if (files.length !== 0) {
        let extensionPattern: string = '.(json|csv|xlsx)$';
        let validExtensions: RegExp = new RegExp(extensionPattern, 'i');
        let fileReaderPromises = [];
        for (let index = 0; index < files.length; index++) {
          if (validExtensions.test(files[index].name)) {
            let splitFilename = files[index].name.split(".");
            let fileType: string = splitFilename[splitFilename.length - 1].toLowerCase();
            if (fileType == "xlsx") {
              fileReaderPromises.push(this.setExcelImportFile(files[index]));
            } else if (fileType.toLowerCase() == "csv") {
              fileReaderPromises.push(this.setCSVImportFile(files[index]));
            }
          } else {
            this.status.invalidFiles.push({ name: files[index].name });
          }
        }
        Promise.all(fileReaderPromises).then((values) => {
          this.finishUpload();
        });
      }
    }
  }

  setExcelImportFile(fileReference: any) {
    return new Promise((resolve, reject) => {
      let fr: FileReader = new FileReader();
      fr.readAsBinaryString(fileReference);
      fr.onload = (e: any) => {
        const bstr: string = e.target.result;
        let workBook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellText: false, cellNF: false });
        // this.finishImportExcel();
        let selectedSheet: string = workBook.SheetNames[0];
        let workSheets = workBook.SheetNames;
        let xlsxRows = XLSX.utils.sheet_to_csv(workBook.Sheets[selectedSheet], { dateNF: "mm/dd/yyyy hh:mm:ss" });
        let xlsxPreviewData: any = this.csvToJsonService.parseCsvWithoutHeaders(xlsxRows).data;
        this.explorerData.fileData.push({ 
          id: this.logToolDataService.getUniqueId(), 
          fileType: '.xlsx',
          name: fileReference.name, 
          workSheets: workSheets,
          workBook: workBook,
          headerRowIndex: 0,
          selectedSheet: selectedSheet,
          data: xlsxRows,
          previewData: xlsxPreviewData,
         });
        resolve(xlsxPreviewData);
      }

      fr.onerror = () => {
        this.status.invalidFiles.push({ name: fileReference.name, message: 'Imported CSV data is invalid' });
          reject(fr);
      };
    });
  }

  setCSVImportFile(fileReference: any) {
    return new Promise((resolve, reject) => {
      let fr: FileReader = new FileReader();
      fr.readAsText(fileReference);
      fr.onloadend = (e) => {
        let fileImportData = JSON.parse(JSON.stringify(fr.result));
        let csvFileData: any = this.csvToJsonService.parseCsvWithoutHeaders(fileImportData).data;
        this.explorerData.fileData.push({ 
          id: this.logToolDataService.getUniqueId(), 
          fileType: '.csv',
          name: fileReference.name,
          headerRowIndex: 0,
          data: fileImportData,
          previewData: csvFileData,
        });
        resolve(csvFileData);
      };

      fr.onerror = () => {
        this.status.invalidFiles.push({ name: fileReference.name, message: 'Imported CSV data is invalid' });
        reject(fr);
      };
    });

  }

  importExistingExplorerJson(files: FileList) {
    this.logToolDataService.setLoadingSpinner(true, 'Uploading File Data')
    this.invalidFileReferences = new Array();
    if (files[0]) {
        let extensionPattern: string = '.(json|JSON)$';
        let validExtensions: RegExp = new RegExp(extensionPattern, 'i');
        if (validExtensions.test(files[0].name)) {
              let fileReaderPromise: Promise<any> = this.setJSONImportFile(files[0]);
              fileReaderPromise.then((value) => {
                this.finishUpload();
              });
        } 
    }
  }

  setJSONImportFile(fileReference: any) {
    return new Promise((resolve, reject) => {
      let fr: FileReader = new FileReader();
      fr.readAsText(fileReference);
      fr.onloadend = (e) => {
        let jsonData = JSON.parse(JSON.stringify(fr.result));
        let logToolDbData: LogToolDbData = JSON.parse(jsonData);
        if (logToolDbData.origin === "AMO-LOG-TOOL-DATA") {
          this.logToolDbService.logToolDbData = [logToolDbData];
          this.logToolDbService.saveData()
          this.logToolDbService.setLogToolData();
          this.explorerData.fileData.push({ 
            id: this.logToolDataService.getUniqueId(), 
            fileType: '.json',
            name: fileReference.name, 
            data: logToolDbData.setupData.individualDataFromCsv,
            previewData: logToolDbData.setupData.individualDataFromCsv
          });
          resolve(logToolDbData);
        } else {
          // invalid data/ file not from us
          let name = logToolDbData.name ? logToolDbData.name : undefined;
          this.status.invalidFiles.push({ name: name, message: 'Imported JSON does not contain AMO-Tools Data Explorer data' });
          resolve(logToolDbData);
        }
      };

      fr.onerror = function () {
        reject(fr);
      };
    });

  }

  removefileReference(index) {
    this.explorerData.fileData.splice(index, 1);
    if (this.explorerData.fileData.length === 0) {
      this.finishUpload();
    }
  }


  async useExampleData() {
    let exampleDataSet: CsvImportData = await this.csvToJsonService.parseExampleCSV();
    this.logToolDataService.addImportDataSet(exampleDataSet, 'Example Data', this.explorerData);
    // navigate to graph -- or do we need to see all tabs
  }

}
