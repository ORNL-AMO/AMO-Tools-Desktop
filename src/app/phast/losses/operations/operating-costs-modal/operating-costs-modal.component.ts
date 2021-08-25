import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-operating-costs-modal',
  templateUrl: './operating-costs-modal.component.html',
  styleUrls: ['./operating-costs-modal.component.css']
})
export class OperatingCostsModalComponent implements OnInit {

  @Input()
  settings: Settings;
  @Output('closeModal')
  closeModal = new EventEmitter<number>();
  @Output('hideModal')
  hideModal = new EventEmitter();

  // result to emit back to parent
  mixedFuelCostsResult: number;

  // Initial array with first fuel
  fuels: Array<OperatingFuel> = [
    {
      name: 'New Fuel',
      usage: 0,
      cost: 0
  }];

  constructor() { }

  ngOnInit(): void {}

  addFuel() {
    let newFuel = {
      name: 'New Fuel',
      usage: 0,
      cost: 0,
    };
    this.fuels.push(newFuel);
  }

  deleteFuel(i: number) {
    this.fuels.splice(i, 1);
  }

  // called every time a fuel field changes
  calculateMixedFuelCosts() {
    let length = this.fuels.length;
    let sum = 0;
    for (let i = 0; i < length; i++){
      sum += this.fuels[i].usage * this.fuels[i].cost;
    }
    this.mixedFuelCostsResult = sum;
  }

  // sum up our mixed fuels and emit them back to parent. See operations-form.html ln 73
  setMixedFuelCosts() {
    this.closeModal.emit(this.mixedFuelCostsResult);
  }

  hideMixedFuelModal() {
    this.hideModal.emit();
  }
}

export interface OperatingFuel {
    name: string,
    usage: number,
    cost: number
}
