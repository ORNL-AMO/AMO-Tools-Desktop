import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { DayTypeGraphService } from '../../day-type-analysis/day-type-graph/day-type-graph.service';
import { IndividualDataFromCsv, LogToolDbData } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-setup-data',
  templateUrl: './setup-data.component.html',
  styleUrls: ['./setup-data.component.css']
})
export class SetupDataComponent implements OnInit {
  dataLoading: boolean = false;
  fileReference: any;
  validFile: boolean;
  importData: any = null;
  importDataFromCsv: CsvImportData;
  previewDataFromCsv: CsvImportData;
  importingData: boolean = false;
  dataExists: boolean = false;
  importSuccesful: boolean = false;
  individualDataFromCsv: Array<IndividualDataFromCsv>;
  previousDataAvailableSub: Subscription;
  previousDataAvailable: Date;
  workSheets: Array<String>;
  workSheetsAvailable: boolean = false;
  selectedSheet: string;
  workBook: XLSX.WorkBook;
  importJsonData: LogToolDbData;
  headerRowOptions: Array<{ value: number, display: number }> = [
    { value: 0, display: 1 },
    { value: 1, display: 2 },
    { value: 2, display: 3 },
    { value: 3, display: 4 },
    { value: 4, display: 5 },
    { value: 5, display: 6 },
    { value: 6, display: 7 },
    { value: 7, display: 8 },
    { value: 8, display: 9 },
    { value: 9, display: 10 },
    { value: 10, display: 11 }
  ];
  itemIndexes: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedHeaderRow: string = "0";
  constructor(private csvToJsonService: CsvToJsonService, private logToolService: LogToolService, private cd: ChangeDetectorRef,
    private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService, private dayTypeGraphService: DayTypeGraphService,
    private logToolDataService: LogToolDataService, private logToolDbService: LogToolDbService) { }

  ngOnInit() {
    this.individualDataFromCsv = this.logToolService.individualDataFromCsv;
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
    this.previousDataAvailableSub = this.logToolDbService.previousDataAvailable.subscribe(val => {
      debugger;
    if (this.dataExists == false && this.logToolService.dataSubmitted.getValue() == false) {
        this.previousDataAvailable = val;
      }
      });
  }

  ngOnDestroy() {
    if (this.previousDataAvailableSub) {
      this.previousDataAvailableSub.unsubscribe();
    }
  }

  setCSVImport($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.csv$/;
        let regex2 = /.CSV$/;
        if (regex.test($event.target.files[0].name) || regex2.test($event.target.files[0].name)) {
          this.fileReference = $event.target.files[0];
          this.validFile = true;
          this.importFile();
        } else {
          this.validFile = false;
          this.dataLoading = false;
        }
      }
    }
  }

  setImport($event) {
    this.dataLoading = true;
    setTimeout(() => {
      let splitName = $event.target.files[0].name.split(".");
      if (splitName[splitName.length - 1] == "xlsx") {
        this.setExcelImport($event);
      } else if (splitName[splitName.length - 1] == "json" || splitName[splitName.length - 1] == "JSON") {
        this.setJSONImport($event);
      } else {
        this.setCSVImport($event);
      }
    }, 100);

  }

  setExcelImport($event) {
    this.fileReference = $event.target.files[0];
    this.importExcel();
  }

  importFile() {   
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference);
    fr.onloadend = (e) => {
      this.importData = JSON.parse(JSON.stringify(fr.result));
      this.parsePreviewData();
      this.dataLoading = false;
    };
  }

  parseExcel() {
    setTimeout(() => {
      this.logToolService.addCsvData(this.csvToJsonService.parseCsvWithHeaders(this.importData, Number(this.selectedHeaderRow)), this.fileReference.name);
      this.importSuccesful = true;
      this.importData = undefined;
      this.importingData = false;
      this.logToolService.dataSubmitted.next(true);
      this.previousDataAvailable = undefined;
      this.logToolDbService.saveData();
      this.cd.detectChanges();
      }, 100);
    
  }

  importExcel() {
    let fr: FileReader = new FileReader();
    fr.onload = (e: any) => {
      const bstr: string = e.target.result;
      this.workBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellText: false, cellNF: false });
      this.selectedSheet = this.workBook.SheetNames[0];
      this.workSheets = this.workBook.SheetNames;
      this.workSheetsAvailable = true;
      this.finishImportExcel();
    }
    fr.readAsBinaryString(this.fileReference);
  }

  finishImportExcel() {
    let rowObject  =  XLSX.utils.sheet_to_csv(this.workBook.Sheets[this.selectedSheet], {dateNF: "mm/dd/yyyy hh:mm:ss"});
    this.importData = rowObject;
    this.parsePreviewData();
    this.dataLoading = false;
  }
 

  parsePreviewData() {
    this.previewDataFromCsv = this.csvToJsonService.parseCsvWithoutHeaders(this.importData);
  }

  parseImportData() {
    this.importingData = true;
    this.previewDataFromCsv = undefined;
    this.cd.detectChanges();
    setTimeout(() => {
      this.importDataFromCsv = this.csvToJsonService.parseCsvWithHeaders(this.importData, Number(this.selectedHeaderRow));
      this.logToolService.addCsvData(this.importDataFromCsv, this.fileReference.name);
      this.importSuccesful = true;
      this.importData = undefined;
      this.importingData = false;
      this.logToolService.dataSubmitted.next(true);
      this.previousDataAvailable = undefined;
      this.logToolDbService.saveData();
      this.cd.detectChanges();
    }, 100);
  }

  resetData() {
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    this.logToolService.resetData();
    this.logToolDataService.resetData();
    this.dataExists = false;
    this.importSuccesful = false;
    this.logToolDbService.saveData()
    this.cd.detectChanges();
  }

  usePreviousData() {
    this.logToolDbService.setLogToolData();
    this.previousDataAvailable = undefined;
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
  }

  setJSONImport($event) {
    this.fileReference = $event.target.files[0];
    this.validFile = true;
    this.importJson();
    // if ($event.target.files) {
    //   if ($event.target.files.length !== 0) {
    //     let regex = /.json$/;
    //     let regex2 = /.JSON$/;
    //     if (regex.test($event.target.files[0].name) || regex2.test($event.target.files[0].name)) {
    //       this.fileReference = $event.target.files[0];
    //       this.validFile = true;
    //       this.importJson();
    //     } else {
    //       this.validFile = false;
    //     }
    //   }
    // }
  }

  importJson(){
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference);
    fr.onloadend = (e) => {
      this.importData = JSON.parse(JSON.stringify(fr.result));
      //this.parsePreviewData();      
      this.runImport(this.importData);
      
    };
    
  }

  runImport(data: string) {
    let jsonImportdata: LogToolDbData = JSON.parse(data);
    if (jsonImportdata.origin === "AMO-LOG-TOOL-DATA") {
      this.logToolDbService.logToolDbData = [jsonImportdata];
      this.logToolDbService.saveData()
      this.cd.detectChanges();
      this.logToolDbService.setLogToolData();
      this.previousDataAvailable = undefined;
      if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
        this.dataExists = true;
      }
      this.dataLoading = false;
    }else {
      this.validFile = false;
      this.dataLoading = false;
    }
  }
}
