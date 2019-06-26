import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { BaseGasDensity } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { GasDensityFormService, GasDensityRanges } from './gas-density-form.service';
import { FsatService } from '../../../../../fsat/fsat.service';

@Component({
  selector: 'app-gas-density-form',
  templateUrl: './gas-density-form.component.html',
  styleUrls: ['./gas-density-form.component.css']
})
export class GasDensityFormComponent implements OnInit {
  // @Input()
  // toggleResetData: boolean;
  @Input()
  fanGasDensity: BaseGasDensity;
  @Input()
  gasDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

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
  constructor(private convertUnitsService: ConvertUnitsService, private gasDensityFormService: GasDensityFormService, private fsatService: FsatService) { }

  ngOnInit() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanGasDensity, this.settings);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
  //     this.resetData();
  //   }
  // }

  resetData() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanGasDensity, this.settings);
    this.save();
  }

  save() {
    this.fanGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.fanGasDensity);
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
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
