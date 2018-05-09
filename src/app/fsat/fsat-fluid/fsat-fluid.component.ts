import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Fsat203Service } from '../../calculator/fans/fsat-203/fsat-203.service';
import { FsatService } from '../fsat.service';
import { FormGroup } from '@angular/forms';
import { BaseGasDensity } from '../../shared/models/fans';
import { FsatFluidService } from './fsat-fluid.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-fsat-fluid',
  templateUrl: './fsat-fluid.component.html',
  styleUrls: ['./fsat-fluid.component.css']
})
export class FsatFluidComponent implements OnInit {
  @Input()
  baseGasDensity: BaseGasDensity;
  @Input()
  gasDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationIndex: number;
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
  constructor(private fsatService: FsatService, private fsatFluidService: FsatFluidService) { }

  ngOnInit() {
    this.init();
    if (!this.selected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  init() {
    this.gasDensityForm = this.fsatFluidService.getGasDensityFormFromObj(this.baseGasDensity);
  }

  disableForm() {
    this.gasDensityForm.controls.gasType.disable();
    this.gasDensityForm.controls.inputType.disable();
    // this.chargeMaterialForm.disable();
  }

  enableForm() {
    this.gasDensityForm.controls.gasType.enable();
    this.gasDensityForm.controls.inputType.enable();
    // this.chargeMaterialForm.enable();
  }

  save() {
    this.baseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.baseGasDensity);
  }

  focusField() {

  }

  getDensity() {
    if (this.gasDensityForm.controls.inputType.value == 'relativeHumidity') {
      this.calcDensityRelativeHumidity();
    } else if (this.gasDensityForm.controls.inputType.value == 'wetBulb') {
      this.calcDensityWetBulb();
    } else if (this.gasDensityForm.controls.inputType.value == 'dewPoint') {
      this.calcDensityDewPoint();
    } else {
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
