import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';
import * as XLSX from 'xlsx';
import { ExplorerData, InvalidFile, LogToolDbData, LogToolField } from '../../log-tool-models';
import { CsvImportData, CsvToJsonService } from '../../../shared/helper-services/csv-to-json.service';
import { Subscription } from 'rxjs';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { DayTypeGraphService } from '../../day-type-analysis/day-type-graph/day-type-graph.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { LogToolService } from '../../log-tool.service';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css'],
})
export class ImportDataComponent implements OnInit {
  invalidFileReferences: Array<InvalidFile> = [];
  explorerData: ExplorerData;
  explorerDataSub: Subscription;
  showDateFormatHelp: boolean = false;
  @ViewChild('importFileRef', { static: false }) importFileRef: ElementRef;

  constructor(
    private logToolDataService: LogToolDataService,
    private logToolService: LogToolService,
    private csvToJsonService: CsvToJsonService,
    private dayTypeAnalysisService: DayTypeAnalysisService,
    private dayTypeGraphService: DayTypeGraphService,
    private visualizeService: VisualizeService,
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

  checkResetFileInput() {
    if (!this.explorerData.isStepFileUploadComplete && this.importFileRef) {
      this.importFileRef.nativeElement.value = "";
    }
  }

  showDateFormatHelpDrawer() {
    this.showDateFormatHelp = true;
    setTimeout(() => {
      this.showDateFormatHelp = false;
    }, 100);
  }

  finishUpload() {
    this.explorerData.isStepFileUploadComplete = this.explorerData.fileData.length !== 0 && this.invalidFileReferences.length === 0;
    this.logToolDataService.loadingSpinner.next({show: false, msg: 'Uploading File Data...'});
    this.logToolDataService.explorerData.next(this.explorerData);
  }
  
  setImportFiles(files: FileList) {
    if (files.length !== 0) {
      this.logToolDataService.loadingSpinner.next({ show: true, msg: 'Uploading File Data...' });
      if (this.explorerData.isExistingImport) {
        this.explorerData = this.logToolDataService.getDefaultExplorerData();
        this.dayTypeAnalysisService.resetData();
        this.visualizeService.resetData();
        this.dayTypeGraphService.resetData();
      } else {
        this.explorerData.isSetupDone = false;
        this.explorerData.isStepHeaderRowComplete = false;
        this.explorerData.refineDataStepStatus.isComplete = false;
        this.explorerData.isStepMapTimeDataComplete = false;
      }
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
        // ignore previously loaded example
        if (this.explorerData.isExample) {
          this.explorerData.isExample = false;
          let exampleIndex = this.explorerData.fileData.findIndex(fileData => fileData.fileType === 'example');
          this.explorerData.fileData.splice(exampleIndex, 1);
          this.explorerData.datasets = [];
        }
        this.finishUpload();
      });
    }
  }

  setExcelImportFile(fileReference: any) {
    return new Promise((resolve, reject) => {
      let fr: FileReader = new FileReader();
      fr.readAsBinaryString(fileReference);
      fr.onload = async (e: any) => {
        const bstr: string = e.target.result;
        let workBook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellText: false, cellNF: false });
        // this.finishImportExcel();
        let selectedSheet: string = workBook.SheetNames[0];
        let workSheets = workBook.SheetNames;
        let xlsxRows = XLSX.utils.sheet_to_csv(workBook.Sheets[selectedSheet], { dateNF: "mm/dd/yyyy hh:mm:ss" });
        let importData: CsvImportData = await this.csvToJsonService.parseCsvWithoutHeaders(xlsxRows);
        let xlsxPreviewData = importData.data;
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
      fr.onloadend = async (e) => {
        let fileImportData = JSON.parse(JSON.stringify(fr.result));
        let importData: CsvImportData = await this.csvToJsonService.parseCsvWithoutHeaders(fileImportData);
        let csvFileData = importData.data;
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
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    this.invalidFileReferences = new Array();
    if (files[0]) {
        let extensionPattern: string = '.(json|JSON)$';
        let validExtensions: RegExp = new RegExp(extensionPattern, 'i');
        if (validExtensions.test(files[0].name)) {
              let fileReaderPromise: Promise<any> = this.setJSONImportFile(files[0]);
              fileReaderPromise.then((logToolDbData) => {
                // noDayTypeAnalysis removal
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
          this.explorerData.isExistingImport = true;
          this.logToolDbService.logToolDbData = [logToolDbData];
          this.logToolDbService.setLogToolData(logToolDbData);
          this.explorerData.fileData.push({ 
            dataSetId: this.logToolDataService.getUniqueId(), 
            fileType: '.json',
            name: fileReference.name, 
            data: logToolDbData.setupData.individualDataFromCsv,
            previewData: logToolDbData.setupData.individualDataFromCsv
          });
          this.logToolDataService.importExistingDataSets(logToolDbData);
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
    let dataSetId: string = this.explorerData.fileData[index].dataSetId;
    this.explorerData.fileData.splice(index, 1);
    if (this.explorerData.fileData.length !== 0) {
      let dataSetIndex: number = this.explorerData.datasets.findIndex(dataSet => dataSet.dataSetId === dataSetId);
      if (dataSetIndex) {
        this.updateDataAndAnalysis(dataSetIndex);
      }
    } else {
      this.logToolDataService.resetSetupData();
      this.dayTypeAnalysisService.resetData();
      this.dayTypeGraphService.resetData();
      this.visualizeService.resetData();
    }
  }

  updateDataAndAnalysis(dataSetIndex: number) {
    this.explorerData.datasets.splice(dataSetIndex, 1);
    this.logToolService.individualDataFromCsv.splice(dataSetIndex, 1);
    if (this.explorerData.isSetupDone) {
      this.logToolDataService.loadingSpinner.next({show: true, msg: 'Re-calculating Data. This may take a moment depending on the amount of data you have supplied.'});
      // set delay to display spinner before blocked thread
      setTimeout(async () => {
        // need to pull out existing data sets
        await this.finalizeDataSetup();
        if (this.dayTypeAnalysisService.dayTypesCalculated) {
          this.runDayTypeAnalysis();
          this.logToolDataService.loadingSpinner.next({show: false, msg: 'Re-calculating Data. This may take a moment depending on the amount of data you have supplied.'});
        }
      }, 25);
    }
  }

  async finalizeDataSetup() {
    this.explorerData = this.logToolDataService.finalizeDataSetup(this.explorerData);
    await this.logToolDbService.saveData();
    this.logToolDataService.explorerData.next(this.explorerData);
  }


  async useExampleData() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: 'Loading Example...'});
    let exampleDataSet: CsvImportData = await this.csvToJsonService.parseExampleCSV();
    let exampleName: string = 'Example Data';
    this.explorerData.fileData.push({ 
      dataSetId: 'example',
      fileType: 'example',
      name: exampleName, 
      data: exampleDataSet.data,
      previewData: exampleDataSet
    });
    this.explorerData.isExample = true;
    this.explorerData = this.logToolDataService.addImportDataSet(exampleDataSet, exampleName, exampleName, this.explorerData);
    this.explorerData = this.logToolDataService.finalizeDataSetup(this.explorerData);
    await this.logToolDbService.saveData();
    this.logToolDataService.explorerData.next(this.explorerData);
    this.runDayTypeAnalysis(true);
    this.setExistingDataComplete();
    this.logToolDataService.loadingSpinner.next({show: false, msg: 'Loading Example...'});
  }

  runDayTypeAnalysis(setDisplayTotalAggregatedId?: boolean) {
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    let allFields: Array<LogToolField> = this.visualizeService.getDataFieldOptions(true);
    let defaultSelectedDataField: LogToolField = allFields[0];
    if (setDisplayTotalAggregatedId) {
      defaultSelectedDataField = allFields.find(field => field.fieldId === 'all');
    }
    this.dayTypeAnalysisService.selectedDataField.next(defaultSelectedDataField);
    this.logToolDataService.setLogToolDays();
    this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
    this.dayTypeAnalysisService.initDayTypes();
    this.dayTypeAnalysisService.setDayTypeSummaries();
    this.dayTypeGraphService.setDayTypeScatterPlotData();
    this.dayTypeGraphService.setIndividualDayScatterPlotData();
    this.dayTypeAnalysisService.dayTypesCalculated = true;
  }

  setExistingDataComplete(canRunDayTypeAnalysis: boolean = true) {
    this.explorerData.isSetupDone = true;
    // remove after - 5839 
    this.explorerData.canRunDayTypeAnalysis = canRunDayTypeAnalysis;
    this.explorerData.isStepFileUploadComplete = true;
    this.explorerData.isStepHeaderRowComplete = true;
    this.explorerData.refineDataStepStatus.isComplete = true;
    this.explorerData.isStepMapTimeDataComplete = true;
  }

}
