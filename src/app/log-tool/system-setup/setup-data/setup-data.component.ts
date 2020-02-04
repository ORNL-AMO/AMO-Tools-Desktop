import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import * as moment from 'moment';
import { _dateFormats } from './date-formats';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { DayTypeGraphService } from '../../day-type-analysis/day-type-graph/day-type-graph.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-setup-data',
  templateUrl: './setup-data.component.html',
  styleUrls: ['./setup-data.component.css']
})
export class SetupDataComponent implements OnInit {

  importInProgress: boolean = false;
  fileReference: any;
  validFile: boolean;
  importData: any = null;
  importDataFromCsv: CsvImportData;
  endDate: Date;
  dateFormat: Array<string>;
  dateFormats: Array<{ display: string, value: Array<string> }> = _dateFormats;
  validDate: boolean;
  importingData: boolean = false;
  dataExists: boolean;
  addingAdditionalData: boolean = false;
  disableImportFile: boolean = false;
  constructor(private csvToJsonService: CsvToJsonService, private logToolService: LogToolService, private cd: ChangeDetectorRef,
    private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService, private dayTypeGraphService: DayTypeGraphService,
    private logToolDataService: LogToolDataService, private router: Router) { }

  ngOnInit() {
    this.dateFormat = this.logToolService.dateFormat;
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
  }

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.csv$/;
        if (regex.test($event.target.files[0].name)) {
          this.fileReference = $event.target.files[0];
          this.validFile = true;
          this.importFile();
        } else {
          this.validFile = false;
        }
      }
    }
  }

  importFile() {
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference);
    fr.onloadend = (e) => {
      this.importData = JSON.parse(JSON.stringify(fr.result));
    };
  }

  parseImportData() {
    this.disableImportFile = true;
    this.validDate = undefined;
    this.importingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.importDataFromCsv = this.csvToJsonService.parseCSV(this.importData);
      let foundDate: string = this.testForDate();
      if (foundDate != undefined) {
        this.validDate = true;
        this.logToolService.invalidDateDataFromCsv = undefined;
        this.logToolService.setImportDataFromCsv(this.importDataFromCsv, this.fileReference.name, this.validDate);
        this.logToolService.parseImportData();
      } else {
        this.logToolService.invalidDateDataFromCsv = this.importDataFromCsv;
        this.validDate = false;
      }
      this.importingData = false;
      this.logToolService.dataSubmitted.next(true);
      this.cd.detectChanges();
    }, 500);
  }

  testForDate(): string {
    if (this.dateFormat != undefined) {
      for (var key in this.importDataFromCsv.data[0]) {
        let value = this.importDataFromCsv.data[0][key];
        let test = moment(value, this.dateFormat, true);
        if (test.isValid() == true) {
          this.logToolService.addDateField(key);
          return value;
        }
      }
    }
    return undefined;
  }

  setDateFormat() {
    this.logToolService.dateFormat = this.dateFormat;
  }

  resetData() {
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    this.logToolService.resetData();
    this.logToolDataService.resetData();
    this.dataExists = false;
  }

  continueWithoutDayType() {
    this.importingData = true;
    this.logToolService.invalidDateDataFromCsv = undefined;
    this.validDate = undefined;
    this.cd.detectChanges();
    setTimeout(() => {
      this.logToolService.noDayTypeAnalysis.next(true);
      this.logToolService.addAdditionalCsvData(this.importDataFromCsv, this.fileReference.name, false);
      this.logToolService.parseImportData();
      this.importingData = false;
      this.logToolService.dataSubmitted.next(true);
    }, 500);
  }

  addAdditionalCsvData() {
    this.fileReference = undefined;
    this.validDate = undefined;
    this.addingAdditionalData = true;
    this.disableImportFile = false;
  }

  parseAdditionalImportData() {
    this.logToolService.dataSubmitted.next(false);
    this.disableImportFile = true;
    this.validDate = undefined;
    this.importingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.importDataFromCsv = this.csvToJsonService.parseCSV(this.importData);
      let foundDate: string = this.testForDate();
      if (foundDate != undefined) {
        this.validDate = true;
        this.logToolService.invalidDateDataFromCsv = undefined;
        this.logToolService.addAdditionalCsvData(this.importDataFromCsv, this.fileReference.name, this.validDate);
        this.logToolService.parseImportData();
      } else {
        this.logToolService.invalidDateDataFromCsv = this.importDataFromCsv;
        this.validDate = false;
      }
      this.importingData = false;
      this.logToolService.dataSubmitted.next(true);
      this.cd.detectChanges();
    }, 500);
  }
}
