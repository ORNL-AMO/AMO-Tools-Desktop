import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';
import { DateSelection, DateSelectionData } from './date-data';
import { WeatherBinsInput, WeatherBinsService, WeatherDataSourceView } from '../../weather-bins.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../../shared/models/settings';
import { WeatherDbService } from '../../weather-db.service';

@Component({
    selector: 'app-data-setup-form',
    templateUrl: './data-setup-form.component.html',
    styleUrls: ['./data-setup-form.component.css'],
    standalone: false
})
export class DataSetupFormComponent implements OnInit {
  @Input()
  settings: Settings;

  fileReference: any;
  validFile: boolean;
  importData: any;
  disableImportFile: boolean;
  importingData: boolean;
  importSuccesful: boolean;
  startDate: Date;
  endDate: Date;
  dateSelectionData: Array<DateSelection>;
  startMonthDays: Array<number>;
  endMonthDays: Array<number>;
  inputData: WeatherBinsInput;
  inputDataSub: Subscription;
  weatherDataSourceView: WeatherDataSourceView;

  previousDataAvailableSub: Subscription;
  previousDataAvailable: Date;
  dataExists: boolean = false;
  weatherDataSourceSubscription: Subscription;
  constructor(private csvToJsonService: CsvToJsonService, 
    private weatherDbService: WeatherDbService, private cd: ChangeDetectorRef, private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.weatherDbService.initWeatherData();
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(inputData => {
      this.inputData = inputData;
      if(this.inputData.fileName){
        this.validFile = true;
        this.dataExists = true;
        } else {
        this.dataExists = false;
      }
    });

    this.weatherDataSourceSubscription = this.weatherBinsService.weatherDataSourceView.subscribe(weatherDataSourceView => {
      this.weatherDataSourceView = weatherDataSourceView;
    })

    this.previousDataAvailableSub = this.weatherDbService.previousDataAvailable.subscribe(val => {
      if (this.dataExists == false && this.weatherBinsService.dataSubmitted.getValue() == false) {
        this.previousDataAvailable = val;
      }
        });


    this.dateSelectionData = DateSelectionData;
    this.startMonthDays = this.dateSelectionData.find(dataSelection => { return dataSelection.monthValue == this.inputData.startMonth }).days;
    this.endMonthDays = this.dateSelectionData.find(dataSelection => { return dataSelection.monthValue == this.inputData.endMonth }).days;
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
    this.weatherDataSourceSubscription.unsubscribe();
    if (this.previousDataAvailableSub) {
      this.previousDataAvailableSub.unsubscribe();
    }
  }

  focusField(str: string) {
    this.weatherBinsService.currentField.next(str);
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

  resetData() {
    this.dataExists = false;
    this.weatherBinsService.dataSubmitted.next(false);
    this.weatherDbService.initWeatherData();
    this.weatherBinsService.resetBinCaseData();
  }

  importFile() {
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference);
    fr.onloadend = (e) => {
      this.importData = JSON.parse(JSON.stringify(fr.result));
    };
  }

  usePreviousData() {
    if (this.weatherBinsService.importDataFromCsv.getValue()) {
      this.weatherBinsService.resetBinCaseData();
    }
    this.weatherDbService.setFromPreviousData();
    let inputData = this.weatherBinsService.inputData.getValue();
    if (inputData.cases.length > 0) {
      this.dataExists = true;
    }
  }

  parseImportData() {
    this.disableImportFile = true;
    this.importingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      if (this.weatherBinsService.importDataFromCsv.getValue()) {
        this.weatherBinsService.resetBinCaseData();
      }
      let csvImportData: CsvImportData = this.csvToJsonService.parseCSV(this.importData);
      this.weatherBinsService.importDataFromCsv.next(csvImportData);
      this.inputData.fileName = this.fileReference.name;
      this.importSuccesful = true;
      this.importData = undefined;
      this.importingData = false;
      this.weatherBinsService.dataSubmitted.next(true);
      this.previousDataAvailable = undefined;
      this.weatherDbService.saveData();
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
    this.weatherBinsService.save(this.inputData, this.settings);
  }
}
