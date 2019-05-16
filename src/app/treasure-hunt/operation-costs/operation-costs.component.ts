import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { TreasureHunt, EnergyUsage } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';

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
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
    if (!this.treasureHunt.currentEnergyUsage) {
      let defaultUsage: EnergyUsage = {
        electricityUsage: 0,
        electricityCosts: 0,
        naturalGasUsage: 0,
        naturalGasCosts: 0,
        otherFuelUsage: 0,
        otherFuelCosts: 0,
        waterUsage: 0,
        waterCosts: 0,
        wasteWaterUsage: 0,
        wasteWaterCosts: 0,
        compressedAirUsage: 0,
        compressedAirCosts: 0,
        steamUsage: 0,
        steamCosts: 0
      }
      this.treasureHunt.currentEnergyUsage = defaultUsage;
      this.save();
    }
  }

  save() {
    this.emitSave.emit(this.treasureHunt);
  }
}
