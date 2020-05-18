import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
import { CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';

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
  constructor(private weatherBinsService: WeatherBinsService, private convertUnitsService: ConvertUnitsService) { }

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
      if (this.settings.unitsOfMeasure != 'Metric') {
        if (this.inputData.autoBinParameter == 'Dry-bulb (C)' || this.inputData.autoBinParameter == 'Dew-point (C)') {
          minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('F').to('C');
          minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('F').to('C');
        } else if (this.inputData.autoBinParameter == 'Wspd (m/s)') {
          minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('ft').to('m');
          minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('ft').to('m');
        } else if (this.inputData.autoBinParameter == 'Pressure (mbar)') {
          minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('inHg').to('mbar');
          minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('inHg').to('mbar');
        } else if (this.inputData.autoBinParameter == 'Lprecip depth (mm)') {
          minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('in').to('mm');
          minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('in').to('mm');
        }
      }
      this.parameterMin = Math.floor(minAndMax.min);
      this.parameterMax = Math.ceil(minAndMax.max);
    }
  }
}
