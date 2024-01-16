import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import {  WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
import { CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { WeatherBinsFormService } from '../weather-bins-form.service';

@Component({
  selector: 'app-bins-form',
  templateUrl: './bins-form.component.html',
  styleUrls: ['./bins-form.component.css']
})
export class BinsFormComponent implements OnInit {
  @Input()
  settings: Settings;

  weatherBinsInput: WeatherBinsInput;
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
  weatherBinsInputSub: Subscription;
  importDataFromCsvSub: Subscription;
  integratedCalculatorSub: Subscription;
  binParametersForms: FormGroup[];

  constructor(private weatherBinsService: WeatherBinsService, private weatherBinFormService: WeatherBinsFormService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
    this.weatherBinsInputSub = this.weatherBinsService.inputData.subscribe(val => {
      this.weatherBinsInput = val;
    });
    
    this.importDataFromCsvSub = this.weatherBinsService.importDataFromCsv.subscribe(importData => {
      this.importDataFromCsv = importData;
      this.initForm();
    });
    this.integratedCalculatorSub = this.weatherBinsService.integratedCalculator.subscribe(integratedCalculator => {
      if (integratedCalculator) {
        this.parameterOptions.filter(option => option.value === integratedCalculator.binningParameters[0]);
        this.hasIntegratedCalculatorParameter = true;
        // todo 6657 disable parameter name field when integrated (it defalts to dry bulb)
      }
    });
    this.initForm();
  }

  ngOnDestroy() {
    this.weatherBinsInputSub.unsubscribe();
    this.importDataFromCsvSub.unsubscribe();
    this.integratedCalculatorSub.unsubscribe();
  }
  initForm() {
    if (this.weatherBinsInput && this.importDataFromCsv) {
      this.binParametersForms = this.weatherBinFormService.getBinParametersForms(this.weatherBinsInput, this.settings);
    }
  }

  focusField(str: string) {
    this.weatherBinsService.currentField.next(str);
  }
  addBinParameter() {
    this.weatherBinFormService.addBinParameter(this.binParametersForms, this.weatherBinsInput, this.settings);
  }

  save() {
    this.weatherBinsInput.cases = [];
    this.weatherBinFormService.setBinParameters(this.binParametersForms, this.weatherBinsInput)
    this.weatherBinsInput = this.weatherBinsService.setAutoBinCases(this.weatherBinsInput, this.settings);
    this.weatherBinsService.save(this.weatherBinsInput, this.settings);
  }

  deleteAllCase(){    
    this.weatherBinsInput.cases = [];
    this.weatherBinsService.inputData.next(this.weatherBinsInput)
  }

  changeParameter(form: FormGroup) {
    this.setParameterMinMax(form);
    this.weatherBinFormService.setStartingValueValidator(form);
    form.controls.startingValue.patchValue(form.controls.min.value)
  }

  setParameterMinMax(form: FormGroup) {
   this.weatherBinFormService.setParameterMinMax(form, this.weatherBinsInput, this.settings);
  }
}