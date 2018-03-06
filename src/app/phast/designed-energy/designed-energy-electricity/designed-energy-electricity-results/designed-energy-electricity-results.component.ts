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
    energyPerTimeUnit: '',
    electricityUsedUnit: ''
  };
  constructor() { }

  ngOnInit() {
    if (this.settings.energyResultUnit == 'kWh') {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit;
    } else {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit + '/hr';
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
    }
    this.resultUnits.electricityUsedUnit = 'kW';
  }

}
