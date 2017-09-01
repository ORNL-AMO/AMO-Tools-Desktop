import { Component, OnInit } from '@angular/core';
import { EnergyEquivalencyFuel, EnergyEquivalencyElectric, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../shared/models/phast/energyEquivalency';
import { PhastService } from '../../../phast/phast.service';
@Component({
  selector: 'app-energy-equivalency',
  templateUrl: './energy-equivalency.component.html',
  styleUrls: ['./energy-equivalency.component.css']
})
export class EnergyEquivalencyComponent implements OnInit {

  energyEquivalencyElectric: EnergyEquivalencyElectric = {
    fuelFiredEfficiency: 60,
    electricallyHeatedEfficiency: 90,
    fuelFiredHeatInput: 10
  };
  energyEquivalencyFuel: EnergyEquivalencyFuel = {
    electricallyHeatedEfficiency: 90,
    fuelFiredEfficiency: 60,
    electricalHeatInput: 1800
  };

  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput = { fuelFiredHeatInput: 0 };
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput = { electricalHeatInput: 0 };

  currentField: string = 'fuelFiredEfficiency';
  tabSelect: string = 'results';
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.calculateElectric();
    this.calculateFuel();
  }

  calculateFuel() {
    this.energyEquivalencyFuelOutput = this.phastService.energyEquivalencyFuel(this.energyEquivalencyFuel);
  }

  calculateElectric() {
    this.energyEquivalencyElectricOutput = this.phastService.energyEquivalencyElectric(this.energyEquivalencyElectric);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


}
