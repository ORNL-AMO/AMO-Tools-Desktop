import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergyFuel } from '../../../../shared/models/phast/designedEnergy';

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
  // @Input()
  // settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  counter: any;

  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate() {
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave.emit(true);
    }, 3000)
  }


}
