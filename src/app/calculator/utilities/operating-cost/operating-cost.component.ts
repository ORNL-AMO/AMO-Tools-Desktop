import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {
  // GENERAL NOTES
  // - this component will be the modal --> I regenerated the component in phast/losses/operations and imported it in operations.module
  // - you'll need to move the code from operating-cost to that operating-costs-modal component

  //  - delete sort by pipe
  // - operating costs service can be deleted and math can be done in here
  // - watch your casing on Types vs vars (Typescript convention is pascal case for types)
  
  
  // instantiate fuels array starting with single fuel
  fuels: Array<OperatingFuel> = [
    {
      name: 'string',
      usage: 0,
      cost: 0
  }
  ];


  @Output('emitFuelCost')
  emitCalculate = new EventEmitter<number>();
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

  AddFuel() {
    // system-capacity-form has an example of this (addPipe())
  }

  calculateMixedFuelCosts() {
    // sum of all fuels fractional usage * costs
    // Emit reuslt back to operating costs page/assessment
  }

}

export interface OperatingFuel {
    name: string,
    usage: number,
    cost: number
}