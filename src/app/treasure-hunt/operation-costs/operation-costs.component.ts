import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { TreasureHunt, EnergyUsage } from '../../shared/models/treasure-hunt';

@Component({
  selector: 'app-operation-costs',
  templateUrl: './operation-costs.component.html',
  styleUrls: ['./operation-costs.component.css']
})
export class OperationCostsComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitSave')
  emitSave = new EventEmitter<TreasureHunt>();
  constructor() { }

  ngOnInit() {
    if (!this.treasureHunt.currentEnergyUsage) {
      let defaultUsage: EnergyUsage = {
        electricityUsage: 0,
        electricityCosts: 0,
        naturalGasUsage: 0,
        naturalGasCosts: 0,
        otherFuelUsage: 0,
        otherFuelCosts: 0
      }
      this.treasureHunt.currentEnergyUsage = defaultUsage;
    }
  }

  save() {
    this.emitSave.emit(this.treasureHunt);
  }
}
