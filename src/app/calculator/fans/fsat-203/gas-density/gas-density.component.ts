import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../../../shared/models/fans';
import { Fsat203Service } from '../fsat-203.service';
import { FsatService } from '../../../../fsat/fsat.service';

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
  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service, private fsatService: FsatService) { }

  ngOnInit() {
    this.gasDensityForm = this.fsat203Service.getGasDensityFormFromObj(this.fanGasDensity);
  }
  save() {
    this.fanGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.fanGasDensity);
  }

  focusField() {

  }

  calcDensityWetBulb() {
    let tmpObj: BaseGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityWetBulb(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityRelativeHumidity() {
    let tmpObj: BaseGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }

  calcDensityDewPoint() {
    let tmpObj: BaseGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    let newDensity: number = this.fsatService.getBaseGasDensityDewPoint(tmpObj);
    this.gasDensityForm.patchValue({
      gasDensity: newDensity
    })
    this.save();
  }
}
