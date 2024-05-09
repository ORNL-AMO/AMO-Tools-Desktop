import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';
import { GasDensityFormService } from '../../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { TraceData } from '../../../../shared/models/plotting';

@Component({
  selector: 'app-fan-psychrometric-form',
  templateUrl: './fan-psychrometric-form.component.html',
  styleUrls: ['./fan-psychrometric-form.component.css']
})
export class FanPsychrometricFormComponent implements OnInit {

  @Input()
  settings: Settings;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Dew Point', value: 'dewPoint' },
  ];

  userDefinedBarometricPressure: boolean = true;
  gasDensityForm: UntypedFormGroup;

  resetFormSubscription: Subscription;
  generateFormSubscription: Subscription;

  constructor(private gasDensityFormService: GasDensityFormService,
    private fanPsychrometricService: FanPsychrometricService,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.initSubscriptions();
    this.save();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.generateFormSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.resetFormSubscription = this.fanPsychrometricService.resetData.subscribe(val => {
      let defaultData = this.fanPsychrometricService.baseGasDensityData.getValue();
      this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(defaultData, this.settings);
      this.hideInputField();
    });
    this.generateFormSubscription = this.fanPsychrometricService.generateExample.subscribe(val => {
      let exampleData = this.fanPsychrometricService.baseGasDensityData.getValue();
      this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(exampleData, this.settings);
      this.hideInputField();
    });
  }

  hideInputField() {
    // Reset to default, i.e. user-defined barometric pressure
    this.userDefinedBarometricPressure = true;
    this.save();
  }

  showHideInputField() {
    this.userDefinedBarometricPressure = !this.userDefinedBarometricPressure;
    if (this.userDefinedBarometricPressure) {
      this.save();
    }
  }

  focusField(str: string) {
    this.fanPsychrometricService.currentField.next(str);
  }

  save() {
    if (!this.userDefinedBarometricPressure) {
      this.gasDensityForm.patchValue({
        barometricPressure: this.calculateBarometricPressure()
      });
    }
    if(this.gasDensityForm.valid){
      this.fanPsychrometricService.disabledChartTab.next(false);
    }
    let newArray = new Array<TraceData>();
    this.fanPsychrometricService.selectedDataPoints.next(newArray);
    let currentData = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.fanPsychrometricService.baseGasDensityData.next(currentData);
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
      barometricPressure = this.convertUnitsService.value(barometricPressure).from('kPa').to('inHg');
    }

    return barometricPressure;
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
