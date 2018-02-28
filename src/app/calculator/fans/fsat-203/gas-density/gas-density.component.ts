import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../../../shared/models/fans';
import { Fsat203Service } from '../fsat-203.service';

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
  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.gasDensityForm = this.fsat203Service.getGasDensityFormFromObj(this.fanGasDensity);
  }
  save() {
    this.fanGasDensity = this.fsat203Service.getGasDensityObjFromForm(this.gasDensityForm);
    this.emitSave.emit(this.fanGasDensity);
  }

  focusField() {

  }
}
