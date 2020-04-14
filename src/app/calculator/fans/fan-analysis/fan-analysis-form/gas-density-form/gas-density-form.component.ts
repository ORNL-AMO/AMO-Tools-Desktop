import { Component, OnInit, Input } from '@angular/core';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { BaseGasDensity, CalculatedGasDensity } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { GasDensityFormService, GasDensityRanges } from './gas-density-form.service';
import { FsatService } from '../../../../../fsat/fsat.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gas-density-form',
  templateUrl: './gas-density-form.component.html',
  styleUrls: ['./gas-density-form.component.css']
})
export class GasDensityFormComponent implements OnInit {
  @Input()
  settings: Settings;

  gasDensityForm: FormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
    { display: 'Use Custom Density', value: 'custom' },
  ];

  gasTypes: Array<{ display: string, value: string }> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ];

  gasDensity: number;
  calculatedGasDensity: CalculatedGasDensity;
  resetFormSubscription: Subscription;
  constructor(private convertUnitsService: ConvertUnitsService, private gasDensityFormService: GasDensityFormService, private fsatService: FsatService,
    private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings);
    this.getDensity();
    this.gasDensity = this.fanAnalysisService.inputData.BaseGasDensity.gasDensity;
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetData();
      }
    })
  }
  
  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
  }

  resetData() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings);
  }

  save() {
    this.fanAnalysisService.inputData.BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.gasDensity = this.fanAnalysisService.inputData.BaseGasDensity.gasDensity;
    this.fanAnalysisService.getResults.next(true);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  getDensity() {
    if (this.gasDensityForm.controls.inputType.value === 'relativeHumidity') {
      this.calcDensityRelativeHumidity();
    } else if (this.gasDensityForm.controls.inputType.value === 'wetBulb') {
      this.calcDensityWetBulb();
    } else if (this.gasDensityForm.controls.inputType.value === 'dewPoint') {
      this.calcDensityDewPoint();
    } else {
      this.save();
    }

    if (this.gasDensityForm.controls.inputType.value != 'custom') {
        this.gasDensityFormService.baselineUpdatedGasDensity.next(this.calculatedGasDensity);
        this.gasDensityFormService.customDensityInputType.next(false);
    } else {
      this.gasDensityFormService.customDensityInputType.next(true);
    }
  }

  calcDensityWetBulb() {
    let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.calculatedGasDensity = this.fsatService.getBaseGasDensityWetBulb(tmpObj, this.settings);
    if (isNaN(this.calculatedGasDensity.gasDensity) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: this.calculatedGasDensity.gasDensity
      });
    } else {
      this.gasDensityForm.patchValue({
        gasDensity: undefined
      });
    }
    this.save();
  }

  calcDensityRelativeHumidity() {
    let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.calculatedGasDensity = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj, this.settings);
    if (isNaN(this.calculatedGasDensity.gasDensity) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: this.calculatedGasDensity.gasDensity
      });
    } else {
      this.gasDensityForm.patchValue({
        gasDensity: undefined
      });
    }
    this.save();
  }

  calcDensityDewPoint() {
    let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.calculatedGasDensity = this.fsatService.getBaseGasDensityDewPoint(tmpObj, this.settings);
    if (isNaN(this.calculatedGasDensity.gasDensity) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: this.calculatedGasDensity.gasDensity
      });
    } else {
      this.gasDensityForm.patchValue({
        gasDensity: undefined
      });
    }
    this.save();
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  setValidators() {
    let ranges: GasDensityRanges = this.gasDensityFormService.getGasDensityRanges(this.settings);
    this.gasDensityFormService.setRelativeHumidityValidators(this.gasDensityForm);
    this.gasDensityFormService.setWetBulbValidators(this.gasDensityForm, ranges);
    this.gasDensityFormService.setDewPointValidators(this.gasDensityForm, ranges);
    this.gasDensityFormService.setCustomValidators(this.gasDensityForm, ranges);
    this.getDensity();
  }
}
