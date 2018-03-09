import { Component, OnInit, Input } from '@angular/core';
import { DesignedEnergyResults } from '../../../../shared/models/phast/designedEnergy';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-designed-energy-electricity-results',
  templateUrl: './designed-energy-electricity-results.component.html',
  styleUrls: ['./designed-energy-electricity-results.component.css']
})
export class DesignedEnergyElectricityResultsComponent implements OnInit {
  @Input()
  totalResults: DesignedEnergyResults;
  @Input()
  electricResults: DesignedEnergyResults;
  @Input()
  fuelResults: DesignedEnergyResults;
  @Input()
  settings: Settings;
  resultUnits: { energyPerMassUnit: string, energyPerTimeUnit: string, electricityUsedUnit: string } = {
    energyPerMassUnit: '',
    energyPerTimeUnit: 'kW/hr',
    electricityUsedUnit: 'kW'
  };
  constructor() { }

  ngOnInit() {
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.resultUnits.energyPerMassUnit = 'kW/kg';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.resultUnits.energyPerMassUnit = 'kW/lb';
    }
  }

}
