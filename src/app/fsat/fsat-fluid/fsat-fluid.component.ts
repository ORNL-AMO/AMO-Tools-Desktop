import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Fsat203Service } from '../../calculator/fans/fsat-203/fsat-203.service';
import { FsatService } from '../fsat.service';
import { FormGroup } from '@angular/forms';
import { BaseGasDensity } from '../../shared/models/fans';
import { FsatFluidService } from './fsat-fluid.service';

@Component({
  selector: 'app-fsat-fluid',
  templateUrl: './fsat-fluid.component.html',
  styleUrls: ['./fsat-fluid.component.css']
})
export class FsatFluidComponent implements OnInit {
  @Input()
  fanGasDensity: BaseGasDensity = {
    dryBulbTemp: 123,
    staticPressure: -17.6,
    barometricPressure: 26.57,
    gasDensity: 0.0547,
    gasType: 'AIR',
    //Mark Additions
    inputType: 'relativeHumidity',
    conditionLocation: 4,
    //Method 2 variables
    specificGravity: 1,
    wetBulbTemp: 119,
    relativeHumidity: 0,
    dewPoint: 0,
    specificHeatGas: .24
  };;
  @Input()
  gasDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();

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
  constructor(private fsatService: FsatService, private fsatFluidService: FsatFluidService) { }

  ngOnInit() {
    this.gasDensityForm = this.fsatFluidService.getGasDensityFormFromObj(this.fanGasDensity);
  }
  save() {
    this.fanGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
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
    let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityWetBulb(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityRelativeHumidity() {
    let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityDewPoint() {
    let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityDewPoint(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

}
