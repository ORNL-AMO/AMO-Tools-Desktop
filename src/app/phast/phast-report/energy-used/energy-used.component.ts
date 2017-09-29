import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { MeteredEnergyService } from '../../metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../designed-energy/designed-energy.service';

@Component({
  selector: 'app-energy-used',
  templateUrl: './energy-used.component.html',
  styleUrls: ['./energy-used.component.css']
})
export class EnergyUsedComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;

  designedResults: DesignedEnergyResults;
  meteredResults: MeteredEnergyResults;

  constructor(private designedEnergyService: DesignedEnergyService, private meteredEnergyService: MeteredEnergyService) { }

  ngOnInit() {
    if (this.settings.energySourceType == 'Steam') {
      this.meteredResults = this.meteredEnergyService.meteredSteam(this.phast.meteredEnergy.meteredEnergySteam, this.phast, this.settings);
      this.designedResults = this.designedEnergyService.designedEnergySteam(this.phast.designedEnergy.designedEnergySteam, this.phast, this.settings);
    } else if (this.settings.energySourceType == 'Electricity') {
      this.meteredResults = this.meteredEnergyService.meteredElectricity(this.phast.meteredEnergy.meteredEnergyElectricity, this.phast, this.settings);
      this.designedResults = this.designedEnergyService.designedEnergyElectricity(this.phast.designedEnergy.designedEnergyElectricity, this.phast, this.settings);
    } else if (this.settings.energySourceType == 'Fuel') {
      this.meteredResults = this.meteredEnergyService.meteredFuel(this.phast.meteredEnergy.meteredEnergyFuel, this.phast, this.settings);
      this.designedResults = this.designedEnergyService.designedEnergyFuel(this.phast.designedEnergy.designedEnergyFuel, this.phast, this.settings);
    }
  }

}
