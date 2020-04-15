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
    this.gasDensityFormService.baselineCalculatedGasDensity.next(undefined);
    this.gasDensityFormService.baselineCalculationType.next(undefined);
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
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.gasDensityForm.controls.inputType.value === 'relativeHumidity') {
      calculatedGasDensity = this.calcDensityRelativeHumidity();
    } else if (this.gasDensityForm.controls.inputType.value === 'wetBulb') {
      calculatedGasDensity = this.calcDensityWetBulb();
    } else if (this.gasDensityForm.controls.inputType.value === 'dewPoint') {
      calculatedGasDensity = this.calcDensityDewPoint();
    }

    if (this.gasDensityForm.controls.inputType.value != 'custom') {
      if (calculatedGasDensity && isNaN(calculatedGasDensity.gasDensity) === false) {
        this.gasDensityForm.patchValue({
          gasDensity: calculatedGasDensity.gasDensity
        });
      } else {
        this.gasDensityForm.patchValue({
          gasDensity: undefined
        });
      }
    }

    this.gasDensityFormService.baselineCalculatedGasDensity.next(calculatedGasDensity);
    this.gasDensityFormService.baselineCalculationType.next(this.gasDensityForm.controls.inputType.value);
    this.save();
  }

  calcDensityWetBulb(): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.isWetBulbValid()) {
      let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
      calculatedGasDensity = this.fsatService.getBaseGasDensityWetBulb(tmpObj, this.settings);
    }
    return calculatedGasDensity;
  }

  isWetBulbValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //wet bulb temp
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.wetBulbTemp.valid);
  }

  calcDensityRelativeHumidity(): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.isRelativeHumidityValid()) {
      let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
      calculatedGasDensity = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj, this.settings);
    }
    return calculatedGasDensity;
  }

  isRelativeHumidityValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //relativeHumidity
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.relativeHumidity.valid);
  }

  calcDensityDewPoint(): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.isDewPointValid()) {
      let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
      calculatedGasDensity = this.fsatService.getBaseGasDensityDewPoint(tmpObj, this.settings);
    }
    return calculatedGasDensity;
  }

  isDewPointValid() {
    //dry bulb
    //static pressure
    //specific gravity
    //dewPoint
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.dewPoint.valid);
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
