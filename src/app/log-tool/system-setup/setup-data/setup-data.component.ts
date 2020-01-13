import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import * as moment from 'moment';
import { _dateFormats } from './date-formats';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
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
  dateFormat: Array<string> = ['DD/MM/YY hh:mm a', 'DD/MM/YY hh:mm A'];
  dateFormats: Array<{ display: string, value: Array<string> }> = _dateFormats;
  validDate: boolean;
  importingData: boolean = false;
  constructor(private csvToJsonService: CsvToJsonService, private logToolService: LogToolService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    // this.dateFormat = this.logToolService.dateFormat;
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
    this.validDate = undefined;
    this.importingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.importDataFromCsv = this.csvToJsonService.parseCSV(this.importData);
      this.logToolService.setImportDataFromCsv(this.importDataFromCsv);
      let foundDate: string = this.testForDate();
      if (foundDate != undefined) {
        this.validDate = true;
        this.logToolService.parseImportData();
      } else {
        this.validDate = false;
      }
      this.importingData = false;
      this.cd.detectChanges();
    }, 500);
  }

  testForDate(): string {
    for (var key in this.importDataFromCsv.data[0]) {
      let value = this.importDataFromCsv.data[0][key];
      let test = moment(value, this.dateFormat, true);
      if (test.isValid() == true) {
        this.logToolService.dateField = key;
        return value;
      }
    }
    return undefined;
  }

  setDateFormat() {
    this.logToolService.dateFormat = this.dateFormat;
  }
}
