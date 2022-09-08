import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';
import * as XLSX from 'xlsx';
import { DataExplorerStatus, ExplorerData, InvalidFile, LogToolDbData } from '../../log-tool-models';
import { CsvImportData, CsvToJsonService } from '../../../shared/helper-services/csv-to-json.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css']
})
export class ImportDataComponent implements OnInit {
  displayTimeDetails: boolean;
  invalidFileReferences: Array<InvalidFile> = [];
  explorerStatusSub: Subscription;
  explorerData: ExplorerData;
  explorerDataSub: Subscription;
  @ViewChild('importFileRef', { static: false }) importFileRef: ElementRef;

  constructor(
    private logToolDataService: LogToolDataService,
    private csvToJsonService: CsvToJsonService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private logToolDbService: LogToolDbService) { }

  ngOnInit(): void {
    this.explorerDataSub = this.logToolDataService.explorerData.subscribe(data => {
      this.explorerData = data;
      this.checkResetFileInput();
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.explorerDataSub.unsubscribe();
  }

  toggleTimeDetails() {
    this.displayTimeDetails = !this.displayTimeDetails;
  }

  checkResetFileInput() {
    if (!this.explorerData.setupCompletion.isStepFileUploadComplete && this.importFileRef) {
      this.importFileRef.nativeElement.value = "";
    }
  }

  finishUpload() {
    this.explorerData.setupCompletion.isStepFileUploadComplete = this.explorerData.fileData.length !== 0 && this.invalidFileReferences.length === 0;
    this.logToolDataService.loadingSpinner.next({show: false, msg: 'Uploading File Data...'});
    this.logToolDataService.explorerData.next(this.explorerData);
  }
  
  setImportFiles(files: FileList) {
    if (files.length !== 0) {
    this.logToolDataService.loadingSpinner.next({show: true, msg: 'Uploading File Data...'});
      this.invalidFileReferences = new Array();
        let extensionPattern: string = '.(csv|xlsx)$';
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
            this.invalidFileReferences.push({ name: files[index].name, message: 'File must be of type .csv or .xlsx. Use "Import Existing Data Exploration" to upload .json' });
          }
        }
        Promise.all(fileReaderPromises).then((values) => {
          this.finishUpload();
        });
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
          dataSetId: this.logToolDataService.getUniqueId(), 
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
        this.invalidFileReferences.push({ name: fileReference.name, message: 'XLSX file cannot be processed. Check your data and try again.' });
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
          dataSetId: this.logToolDataService.getUniqueId(), 
          fileType: '.csv',
          name: fileReference.name,
          headerRowIndex: 0,
          data: fileImportData,
          previewData: csvFileData,
        });
        resolve(csvFileData);
      };

      fr.onerror = () => {
        this.invalidFileReferences.push({ name: fileReference.name, message: 'CSV file cannot be processed. Check your data and try again.' });
        reject(fr);
      };
    });

  }

  importExistingExplorerJson(files: FileList) {
    this.logToolDataService.loadingSpinner.next({show: true, msg: 'Uploading File Data...'});
    this.invalidFileReferences = new Array();
    if (files[0]) {
        let extensionPattern: string = '.(json|JSON)$';
        let validExtensions: RegExp = new RegExp(extensionPattern, 'i');
        if (validExtensions.test(files[0].name)) {
              let fileReaderPromise: Promise<any> = this.setJSONImportFile(files[0]);
              fileReaderPromise.then((logToolDbData) => {
                this.setExistingDataComplete(!logToolDbData.setupData.noDayTypeAnalysis)
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
            dataSetId: this.logToolDataService.getUniqueId(), 
            fileType: '.json',
            name: fileReference.name, 
            data: logToolDbData.setupData.individualDataFromCsv,
            previewData: logToolDbData.setupData.individualDataFromCsv
          });
          resolve(logToolDbData);
        } else {
          let name = logToolDbData.name ? logToolDbData.name : undefined;
          this.invalidFileReferences.push({ name: name, message: 'The uploaded JSON file does not contain AMO-Tools Data Explorer data' });
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
      this.logToolDataService.resetSetupData();
    }
  }

  async useExampleData() {
    let exampleDataSet: CsvImportData = await this.csvToJsonService.parseExampleCSV();
    let exampleName: string = 'Example Data';
    this.setExistingDataComplete();
    this.explorerData.fileData.push({ 
      dataSetId: this.logToolDataService.getUniqueId(), 
      fileType: 'example',
      name: exampleName, 
      data: exampleDataSet.data,
      previewData: exampleDataSet
    })
    this.explorerData = this.logToolDataService.addImportDataSet(exampleDataSet, exampleName, exampleName, this.explorerData);
    this.explorerData.isExample = true;
    this.logToolDataService.explorerData.next(this.explorerData);
    this.router.navigateByUrl('/log-tool/data-setup/select-header-data');
  }

  setExistingDataComplete(canRunDayTypeAnalysis: boolean = true) {
    this.explorerData.isSetupDone = true;
    // remove after - 5839 
    this.explorerData.canRunDayTypeAnalysis = canRunDayTypeAnalysis;
    this.explorerData.setupCompletion.isStepFileUploadComplete = true;
    this.explorerData.setupCompletion.isStepHeaderRowComplete = true;
    this.explorerData.setupCompletion.isStepRefineComplete = true;
    this.explorerData.setupCompletion.isStepMapTimeDataComplete = true;
  }

}
