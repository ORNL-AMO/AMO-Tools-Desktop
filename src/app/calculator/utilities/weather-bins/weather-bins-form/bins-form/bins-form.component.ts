import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import {  WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
import { CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';
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
  parameterOptions: Array<{display: string, value: string}>;
  hasIntegratedCalculatorParameter: boolean = false;
  weatherBinsInputSub: Subscription;
  importDataFromCsvSub: Subscription;
  integratedCalculatorSub: Subscription;
  binParametersForms: FormGroup[];
  updateBinParametersForm: any;

  constructor(private weatherBinsService: WeatherBinsService,
    private weatherBinFormService: WeatherBinsFormService) { }

  ngOnInit(): void {
    this.parameterOptions = this.weatherBinsService.getParameterOptions(this.settings);
    
    this.importDataFromCsvSub = this.weatherBinsService.importDataFromCsv.subscribe(importData => {
      this.importDataFromCsv = importData;
      this.initForm();
    });

    this.weatherBinsInputSub = this.weatherBinsService.inputData.subscribe(val => {
      this.weatherBinsInput = val;
    });

    // * avoid circular updates and unecessary renders of bin-detail forms
    this.updateBinParametersForm = this.weatherBinFormService.updateBinParametersForm.subscribe(update => {
      this.initForm();
    })

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
    this.updateBinParametersForm.unsubscribe();
  }
  initForm() {
    if (this.weatherBinsInput && this.importDataFromCsv) {
      this.binParametersForms = this.weatherBinFormService.getBinParametersForms(this.weatherBinsInput, this.settings);
    }
  }
  
  getIsDisabled(parameterIndex: number, casesLength: number, binForm: FormGroup): boolean {
    return (parameterIndex !== 0 && casesLength === 0) || (binForm && !binForm.valid);
  }

  focusField(str: string) {
    this.weatherBinsService.currentField.next(str);
  }
  addBinParameter() {
    this.weatherBinFormService.addBinParameter(this.binParametersForms, this.weatherBinsInput, this.settings);
  }

  save(parameterIndex: number) {
    this.weatherBinFormService.setBinParameters(this.binParametersForms, this.weatherBinsInput);
    let parametersValid = this.weatherBinFormService.getFormValid(this.binParametersForms);
    if (parametersValid) {
      if (parameterIndex === 0) {
        this.weatherBinsInput = this.weatherBinsService.setAutoBinCases(this.weatherBinsInput, this.settings);
      } else if (parameterIndex === 1 && this.weatherBinsInput.cases.length !== 0) {
        this.weatherBinsInput.cases.map(yParameterBin => {
          yParameterBin.caseParameters = []
        });
        this.weatherBinsInput = this.weatherBinsService.setAutoSubBins(this.weatherBinsInput);
      }
      this.weatherBinsService.save(this.weatherBinsInput, this.settings);
    }
  }

  clearBins(parameterIndex: number){   
    if (parameterIndex === 0) {
      this.weatherBinsInput.cases = [];
    } else if (parameterIndex === 1 && this.weatherBinsInput.cases.length !== 0){
      this.weatherBinsInput.cases.map(yParameterBin => {
        yParameterBin.caseParameters = []
      });
    }
    this.weatherBinsService.save(this.weatherBinsInput, this.settings);
  }

  deleteBinParameter(index: number) {
    this.weatherBinsInput.binParameters.splice(index, 1);
    this.weatherBinsService.setGraphType(this.weatherBinsInput);
    this.weatherBinsService.inputData.next(this.weatherBinsInput);
    this.weatherBinFormService.updateBinParametersForm.next(true);
  }

  changeParameter(form: FormGroup, parameterIndex: number) {
    this.setParameterMinMax(form);
    this.weatherBinFormService.setStartingValueValidator(form);
    this.weatherBinFormService.setRangeValidator(form);
    form.controls.startingValue.patchValue(form.controls.min.value);
    this.clearBins(parameterIndex);
  }

  setParameterMinMax(form: FormGroup) {
   this.weatherBinFormService.setParameterMinMax(form, this.weatherBinsInput, this.settings);
  }
}