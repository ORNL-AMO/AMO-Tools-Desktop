import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergyElectricity } from '../../../../shared/models/phast/designedEnergy';

@Component({
  selector: 'app-designed-energy-electricity-form',
  templateUrl: './designed-energy-electricity-form.component.html',
  styleUrls: ['./designed-energy-electricity-form.component.css','../../../../psat/explore-opportunities/explore-opportunities-form/explore-opportunities-form.component.css']
})
export class DesignedEnergyElectricityFormComponent implements OnInit {
  @Input()
  inputs: DesignedEnergyElectricity;
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
    // this.startSavePolling();
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
