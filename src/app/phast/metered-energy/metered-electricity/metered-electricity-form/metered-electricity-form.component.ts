import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyElectricity } from '../../../../shared/models/phast/meteredEnergy';

@Component({
  selector: 'app-metered-electricity-form',
  templateUrl: './metered-electricity-form.component.html',
  styleUrls: ['./metered-electricity-form.component.css', '../../../../psat/explore-opportunities/explore-opportunities-form/explore-opportunities-form.component.css']
})
export class MeteredElectricityFormComponent implements OnInit {
  @Input()
  inputs: MeteredEnergyElectricity;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  // @Input()
  // settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  inCalc: boolean;

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
    this.emitSave.emit(true);
  }

}
