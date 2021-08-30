import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import {  WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
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
  parameterOptions: Array<{display: string, value: string}> = [
    {display: "Dry-bulb Temperature", value: "Dry-bulb (C)"},
    {display: "Wet-bulb Temperature", value: "Wet Bulb (C)"},
    {display: "Relative Humidity", value: "RHum (%)"},
    {display: "Dew-point", value: "Dew-point (C)"},
    {display: "Wind Speed", value: "Wspd (m/s)"},
    {display: "Wind Direction", value: "Wdir (degrees)"},
    {display: "Liquid Precipitation Depth", value: "Lprecip depth (mm)"},
    {display: "Pressure", value: "Pressure (mbar)"},
  ];
  hasIntegratedCalculatorParameter: boolean = false;
  integratedCalculatorSub: Subscription;
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

    this.integratedCalculatorSub = this.weatherBinsService.integratedCalculator.subscribe(integratedCalculator => {
      if (integratedCalculator) {
        this.parameterOptions.filter(option => option.value === integratedCalculator.binningParameters[0]);
        this.hasIntegratedCalculatorParameter = true;
      }
  });
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
    this.importDataFromCsvSub.unsubscribe();
    this.integratedCalculatorSub.unsubscribe();
  }


  save() {
    this.inputData = this.weatherBinsService.setAutoBinCases(this.inputData, this.settings);
    this.weatherBinsService.save(this.inputData, this.settings);
  }

  deleteAllCase(){    
    this.inputData.cases = [];
    this.weatherBinsService.inputData.next(this.inputData)
  }



  setParameterMinMax() {
    if (this.importDataFromCsv) {
      let minAndMax: { min: number, max: number } = this.weatherBinsService.getParameterMinMax(this.inputData, this.inputData.autoBinParameter, this.settings);
      // if (this.settings.unitsOfMeasure != 'Metric') {
      //   if (this.inputData.autoBinParameter == 'Dry-bulb (C)' || this.inputData.autoBinParameter == 'Wet Bulb (C)' || this.inputData.autoBinParameter == 'Dew-point (C)') {
      //     minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('C').to('F');
      //     minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('C').to('F');
      //   } else if (this.inputData.autoBinParameter == 'Wspd (m/s)') {
      //     minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('m').to('ft');
      //     minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('m').to('ft');
      //   } else if (this.inputData.autoBinParameter == 'Pressure (mbar)') {
      //     minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('mbar').to('inHg');
      //     minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('mbar').to('inHg');
      //   } else if (this.inputData.autoBinParameter == 'Lprecip depth (mm)') {
      //     minAndMax.min = this.convertUnitsService.value(minAndMax.min).from('mm').to('in');
      //     minAndMax.max = this.convertUnitsService.value(minAndMax.max).from('mm').to('in');
      //   }
      // }
      this.parameterMin = Math.floor(minAndMax.min);
      this.parameterMax = Math.ceil(minAndMax.max);
    }
  }
}