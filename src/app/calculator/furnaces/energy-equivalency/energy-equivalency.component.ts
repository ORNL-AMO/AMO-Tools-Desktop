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
    fuelFiredEfficiency: 6.59,
    electricallyHeatedEfficiency: 50,
    fuelFiredHeatInput: 87.3
  };
  energyEquivalencyFuel: EnergyEquivalencyFuel = {
    electricallyHeatedEfficiency: 52.3,
    fuelFiredEfficiency: 58.9,
    electricalHeatInput: 700
  };

  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput = { fuelFiredHeatInput: 0 };
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput = { electricalHeatInput: 0 };
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.calculateElectric();
    this.calculateFuel();
  }

  calculateFuel(){
    this.energyEquivalencyFuelOutput = this.phastService.energyEquivalencyFuel(this.energyEquivalencyFuel);
  }

  calculateElectric(){
    this.energyEquivalencyElectricOutput = this.phastService.energyEquivalencyElectric(this.energyEquivalencyElectric);
  }

}
