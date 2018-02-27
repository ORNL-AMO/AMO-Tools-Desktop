import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../../../shared/models/fans';

@Component({
  selector: 'app-gas-density',
  templateUrl: './gas-density.component.html',
  styleUrls: ['./gas-density.component.css']
})
export class GasDensityComponent implements OnInit {
  @Input()
  fanGasDensity: BaseGasDensity;
  @Output('emitCanContinue')
  emitCanContinue = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();

  gasDensityForm: FormGroup;

  // methods: Array<any> = [
  //   {
  //     id: 1,
  //     name: 'Input a reference density at reference temperature and pressure condition'
  //   }, {
  //     id: 2,
  //     name: 'Calculate base gas density from dry bulb temperature, static pressure, barometric pressure, specific gravity, and gas humidity data'
  //   }
  // ]

  methods: Array<string> = [
    'Relative Humidity %',
    'Wet Bulb Temperature',
    'Gas Dew Point',
    'Use Custom Density'
  ]

  gasTypes: Array<any> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ]
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.gasDensityForm = this.getFormFromObj(this.fanGasDensity);
    this.checkForm();
  }

  checkForm() {
    if (this.gasDensityForm.status == 'VALID') {
      this.emitCanContinue.emit(true);
    } else {
      this.emitCanContinue.emit(false);
    }
  }

  save() {
    this.checkForm();
    this.fanGasDensity = this.getObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.fanGasDensity);
  }

  focusField() {

  }

  getFormFromObj(obj: BaseGasDensity): FormGroup {
    let form = this.formBuilder.group({
      method: [obj.method, Validators.required],
      gasType: [obj.gasType, Validators.required],
      // humidityData: ['Yes', Validators.required],
      conditionLocation: [obj.conditionLocation, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, Validators.required],
      staticPressure: [obj.staticPressure, Validators.required],
      barometricPressure: [obj.barometricPressure, Validators.required],
      gasSpecificGravity: [obj.gasSpecificGravity, Validators.required],
      wetBulbTemp: [obj.wetBulbTemp, Validators.required],
      relativeHumidity: [obj.relativeHumidity, Validators.required],
      gasDewpointTemp: [obj.gasDewpointTemp, Validators.required],
      gasDensity: [obj.gasDensity, Validators.required],
    })
    return form;
  }

  getObjFromForm(form: FormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      method: form.controls.method.value,
      gasType: form.controls.gasType.value,
      //  humidityData: form.controls.humidityData.value,
      conditionLocation: form.controls.conditionLocation.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      staticPressure: form.controls.staticPressure.value,
      barometricPressure: form.controls.barometricPressure.value,
      gasSpecificGravity: form.controls.gasSpecificGravity.value,
      wetBulbTemp: form.controls.wetBulbTemp.value,
      relativeHumidity: form.controls.relativeHumidity.value,
      gasDewpointTemp: form.controls.gasDewpointTemp.value,
      gasDensity: form.controls.gasDensity.value
    }
    return fanGasDensity;
  }
}
