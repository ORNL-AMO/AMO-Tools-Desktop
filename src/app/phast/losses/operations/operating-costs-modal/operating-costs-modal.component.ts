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
  @Output('changeField')
  changeField = new EventEmitter<string>();

  // result to emit back to parent
  mixedFuelCostsResult: number;

  // Initial array with first fuel
  fuels: Array<OperatingFuel> = [
    {
      name: 'New Source',
      usage: 0,
      cost: 0
  }];

  constructor() { }

  ngOnInit(): void {}

  addFuel() {
    let newFuel = {
      name: 'New Source',
      usage: 0,
      cost: 0,
    };
    this.fuels.push(newFuel);
  }

  deleteFuel(i: number) {
    this.fuels.splice(i, 1);
    this.calculateMixedFuelCosts();
  }

  // called every time a fuel field changes
  calculateMixedFuelCosts() {
    let length: number = this.fuels.length;
    let sum: number = 0;
    let summedUse: number = 0;
    for (let i = 0; i < length; i++){
      summedUse += this.fuels[i].usage;
      sum += (this.fuels[i].usage * this.fuels[i].cost);      
    }
    sum = sum / (summedUse);
    this.mixedFuelCostsResult = this.roundVal(sum);    
  }
  
  roundVal(num: number): number {
    return Number(num.toFixed(2));
  }

  // sum up our mixed fuels and emit them back to parent. See operations-form.html ln 73
  setMixedFuelCosts() {
    this.closeModal.emit(this.mixedFuelCostsResult);
  }

  hideMixedFuelModal() {
    this.hideModal.emit();
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }
}


export interface OperatingFuel {
    name: string,
    usage: number,
    cost: number
}
