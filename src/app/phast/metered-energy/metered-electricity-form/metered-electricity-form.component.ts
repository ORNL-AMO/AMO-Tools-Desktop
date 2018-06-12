import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyElectricity } from '../../../shared/models/phast/meteredEnergy';

@Component({
  selector: 'app-metered-electricity-form',
  templateUrl: './metered-electricity-form.component.html',
  styleUrls: ['./metered-electricity-form.component.css']
})
export class MeteredElectricityFormComponent implements OnInit {
  @Input()
  inputs: MeteredEnergyElectricity;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  inCalc: boolean;

  constructor() { }

  ngOnInit() {
  }
 
  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate() {
    this.emitSave.emit(true);
    this.emitCalculate.emit(true);
  }

}
