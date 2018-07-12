import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseGasDensity } from '../../../../shared/models/fans';
import { Fsat203Service } from '../fsat-203.service';
import { FsatService } from '../../../../fsat/fsat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-gas-density',
  templateUrl: './gas-density.component.html',
  styleUrls: ['./gas-density.component.css']
})
export class GasDensityComponent implements OnInit {
  @Input()
  fanGasDensity: BaseGasDensity;
  @Input()
  gasDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();
  @Input()
  settings: Settings;
  
  gasDensityForm: FormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
    { display: 'Use Custom Density', value: 'custom' },
  ]

  gasTypes: Array<{ display: string, value: string }> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ]
  constructor(private convertUnitsService: ConvertUnitsService, private fsat203Service: Fsat203Service, private fsatService: FsatService) { }

  ngOnInit() {
    this.gasDensityForm = this.fsat203Service.getGasDensityFormFromObj(this.fanGasDensity);
  }
  save() {
    this.fanGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.fanGasDensity);
  }

  focusField() {

  }

  getDensity(){
    if(this.gasDensityForm.controls.inputType.value == 'relativeHumidity'){
      this.calcDensityRelativeHumidity();
    }else if(this.gasDensityForm.controls.inputType.value == 'wetBulb'){
      this.calcDensityWetBulb();
    }else if(this.gasDensityForm.controls.inputType.value == 'dewPoint'){
      this.calcDensityDewPoint();
    }else{
      this.save();
    }
  }

  calcDensityWetBulb() {
    let tmpObj: BaseGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityWetBulb(tmpObj, this.settings);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityRelativeHumidity() {
    let tmpObj: BaseGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj, this.settings);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityDewPoint() {
    let tmpObj: BaseGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityDewPoint(tmpObj, this.settings);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
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
