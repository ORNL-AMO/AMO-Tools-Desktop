import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';
import { DateSelection, DateSelectionData } from './date-data';
import { WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-setup-form',
  templateUrl: './data-setup-form.component.html',
  styleUrls: ['./data-setup-form.component.css']
})
export class DataSetupFormComponent implements OnInit {

  fileReference: any;
  validFile: boolean;
  importData: any;
  disableImportFile: boolean;
  importingData: boolean;
  importSuccesful: boolean;
  importDataFromCsv: CsvImportData;
  startDate: Date;
  endDate: Date;
  dateSelectionData: Array<DateSelection>;
  startMonthDays: Array<number>;
  endMonthDays: Array<number>;
  inputData: WeatherBinsInput;
  inputDataSub: Subscription;
  constructor(private csvToJsonService: CsvToJsonService, private cd: ChangeDetectorRef, private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(inputData => {
      this.inputData = inputData;
    });
    this.dateSelectionData = DateSelectionData;
    this.startMonthDays = this.dateSelectionData.find(dataSelection => { return dataSelection.monthValue == this.inputData.startMonth }).days;
    this.endMonthDays = this.dateSelectionData.find(dataSelection => { return dataSelection.monthValue == this.inputData.endMonth }).days;
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
  }

  setImportFile($event) {
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

  importFile() {
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference);
    fr.onloadend = (e) => {
      this.importData = JSON.parse(JSON.stringify(fr.result));
    };
  }

  parseImportData() {
    this.disableImportFile = true;
    this.importingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.importDataFromCsv = this.csvToJsonService.parseCSV(this.importData);
      this.weatherBinsService.setDataFields(this.importDataFromCsv);
      this.importSuccesful = true;
      this.importData = undefined;
      this.importingData = false;
      this.cd.detectChanges();
    }, 100);
  }

  setDates() {
    this.startDate = new Date();
  }

  setStartMonth() {
    this.startMonthDays = this.dateSelectionData.find(dataSelection => { return dataSelection.monthValue == this.inputData.startMonth }).days;
    this.save();
  }

  setEndMonth() {
    this.endMonthDays = this.dateSelectionData.find(dataSelection => { return dataSelection.monthValue == this.inputData.endMonth }).days;
    this.save();
  }

  save() {
    this.weatherBinsService.inputData.next(this.inputData);
  }
}
