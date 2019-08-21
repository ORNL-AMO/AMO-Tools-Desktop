import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { BaseGasDensity } from '../../../../../shared/models/fans';
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
  resetFormSubscription: Subscription;
  constructor(private convertUnitsService: ConvertUnitsService, private gasDensityFormService: GasDensityFormService, private fsatService: FsatService,
    private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings);
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
  }

  calcDensityWetBulb() {
    let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityWetBulb(tmpObj, this.settings);
    if (isNaN(newDensity) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: newDensity
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
    let newDensity: number = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj, this.settings);
    if (isNaN(newDensity) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: newDensity
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
    let newDensity: number = this.fsatService.getBaseGasDensityDewPoint(tmpObj, this.settings);
    if (isNaN(newDensity) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: newDensity
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
