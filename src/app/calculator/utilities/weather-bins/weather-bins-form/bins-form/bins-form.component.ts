import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
import { CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';

@Component({
  selector: 'app-bins-form',
  templateUrl: './bins-form.component.html',
  styleUrls: ['./bins-form.component.css']
})
export class BinsFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputData: WeatherBinsInput;
  inputDataSub: Subscription;
  importDataFromCsvSub: Subscription;
  importDataFromCsv: CsvImportData;
  parameterMin: number;
  parameterMax: number;
  constructor(private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(val => {
      this.inputData = val;
      this.setParameterMinMax();
    });

    this.importDataFromCsvSub = this.weatherBinsService.importDataFromCsv.subscribe(importData => {
      this.importDataFromCsv = importData;
      this.setParameterMinMax();
    });
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
    this.importDataFromCsvSub.unsubscribe();
  }


  save() {
    this.inputData = this.weatherBinsService.setAutoBinCases(this.inputData);
    this.weatherBinsService.save(this.inputData, this.settings);
  }

  setParameterMinMax() {
    if (this.importDataFromCsv) {
      let minAndMax: { min: number, max: number } = this.weatherBinsService.getParameterMinMax(this.inputData, this.inputData.autoBinParameter);
      this.parameterMin = minAndMax.min;
      this.parameterMax = minAndMax.max;
    }
  }
}
