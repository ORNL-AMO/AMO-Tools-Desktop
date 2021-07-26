import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { DayTypeGraphService } from '../../day-type-analysis/day-type-graph/day-type-graph.service';
import { IndividualDataFromCsv } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-setup-data',
  templateUrl: './setup-data.component.html',
  styleUrls: ['./setup-data.component.css']
})
export class SetupDataComponent implements OnInit {

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
    if (this.dataExists == false && this.logToolService.dataSubmitted.getValue() == false) {
      this.previousDataAvailableSub = this.logToolDbService.previousDataAvailable.subscribe(val => {
        this.previousDataAvailable = val;
      });
    }
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
        }
      }
    }
  }

  setImport($event) {
    let splitName = $event.target.files[0].name.split(".");
    if (splitName[splitName.length - 1] == "xlsx") {
      this.setExcelImport($event);
    }
    else {
      this.setCSVImport($event);
    }
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
      let workBook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellText: false, cellNF: false });
      let rowObject  =  XLSX.utils.sheet_to_csv(workBook.Sheets[workBook.SheetNames[0]], {dateNF: "mm/dd/yyyy hh:mm:ss"});
      this.importData = rowObject;
      this.parsePreviewData();
    }
    fr.readAsBinaryString(this.fileReference);
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
}
