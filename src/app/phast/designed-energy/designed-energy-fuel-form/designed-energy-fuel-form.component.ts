import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergyFuel } from '../../../shared/models/phast/designedEnergy';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-designed-energy-fuel-form',
  templateUrl: './designed-energy-fuel-form.component.html',
  styleUrls: ['./designed-energy-fuel-form.component.css']
})
export class DesignedEnergyFuelFormComponent implements OnInit {
  @Input()
  inputs: DesignedEnergyFuel;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.emitSave.emit(true);
    this.emitCalculate.emit(true);
  }

}
