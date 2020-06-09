import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { GasDensityFormService } from '../../fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { FormGroup } from '@angular/forms';
import { FanPsychometricService } from '../fan-psychometric.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-psychometric-form',
  templateUrl: './fan-psychometric-form.component.html',
  styleUrls: ['./fan-psychometric-form.component.css']
})
export class FanPsychometricFormComponent implements OnInit {

  @Input()
  settings: Settings;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
  ];
  
  userDefinedBarometricPressure: boolean = true;
  gasDensityForm: FormGroup;
  gasDensityResult: number;

  resetFormSubscription: Subscription;
  generateFormSubscription: Subscription;
  gasDensityResultSubscription: Subscription;

  constructor(private gasDensityFormService: GasDensityFormService,
    private fanPsychometricService: FanPsychometricService,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    let baseGasDensityData = this.fanPsychometricService.baseGasDensityData.getValue();
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, this.settings);
    this.gasDensityResult = baseGasDensityData.gasDensity;
    this.save();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.generateFormSubscription.unsubscribe();
    this.gasDensityResultSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.resetFormSubscription = this.fanPsychometricService.resetData.subscribe(val => {
      let defaultData = this.fanPsychometricService.baseGasDensityData.getValue();
      this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(defaultData, this.settings);
    });
    this.generateFormSubscription = this.fanPsychometricService.generateExample.subscribe(val => {
      let exampleData = this.fanPsychometricService.baseGasDensityData.getValue();
      this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(exampleData, this.settings);
    });
    this.gasDensityResultSubscription = this.fanPsychometricService.gasDensityResult.subscribe(value => {
      this.updateFormGasDensityResult(value);
    });
  }

  showHideInputField() {
    this.userDefinedBarometricPressure = !this.userDefinedBarometricPressure;
    if(this.userDefinedBarometricPressure) {
      this.save();
    }
  }

  focusField(str: string) {
    this.fanPsychometricService.currentField.next(str);
  }

  save() {
    if (!this.userDefinedBarometricPressure) {
      this.gasDensityForm.patchValue({
        barometricPressure: this.calculateBarometricPressure()
      });
    }
    let currentData = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.fanPsychometricService.baseGasDensityData.next(currentData);
  }

  calculateBarometricPressure() {
    let altitude = this.gasDensityForm.controls.altitude.value;
    if (this.settings.unitsOfMeasure != 'Metric') {
      altitude = this.convertUnitsService.value(altitude).from('ft').to('m');
    }
    let parensOp = 1 - .0000225577 * altitude;
    let exponentOp = Math.pow(parensOp, 5.2559);
    let barometricPressure = 101.325 * exponentOp;
    if (this.settings.unitsOfMeasure != 'Metric') {
      barometricPressure = this.convertUnitsService.value(barometricPressure).from('kPaa').to('psia');
    }

    return barometricPressure;
  }

  updateFormGasDensityResult(gasDensityResult: number) {
    this.gasDensityResult = gasDensityResult;
    if (isNaN(gasDensityResult) === false) {
      this.gasDensityForm.patchValue({
        gasDensity: gasDensityResult
      });
    } else {
      this.gasDensityForm.patchValue({
        gasDensity: undefined
      });
    }
  }
  
  setValidators() {
    this.gasDensityForm = this.gasDensityFormService.setValidators(this.gasDensityForm, this.settings);
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
}
