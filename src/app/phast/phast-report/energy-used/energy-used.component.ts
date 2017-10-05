import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { MeteredEnergyService } from '../../metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../designed-energy/designed-energy.service';
import { PhastResultsService } from '../../phast-results.service';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
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

  designedResults: DesignedEnergyResults = {
    designedEnergyUsed: 0,
    designedEnergyIntensity: 0,
    designedElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };
  meteredResults: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };

  baseLineResults: PhastResults;
  heatingValue: number = 0;
  constructor(private designedEnergyService: DesignedEnergyService, private meteredEnergyService: MeteredEnergyService, private phastResultsService: PhastResultsService, private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    if (this.settings.energySourceType == 'Steam') {
      if (this.phast.meteredEnergy) {
        this.meteredResults = this.meteredEnergyService.meteredSteam(this.phast.meteredEnergy.meteredEnergySteam, this.phast, this.settings);
      } if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.designedEnergySteam(this.phast.designedEnergy.designedEnergySteam, this.phast, this.settings);
      }
    } else if (this.settings.energySourceType == 'Electricity') {
      if (this.phast.meteredEnergy) {
        this.meteredResults = this.meteredEnergyService.meteredElectricity(this.phast.meteredEnergy.meteredEnergyElectricity, this.phast, this.settings);
      } if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.designedEnergyElectricity(this.phast.designedEnergy.designedEnergyElectricity, this.phast, this.settings);
      }
    } else if (this.settings.energySourceType == 'Fuel') {
      if (this.phast.meteredEnergy) {
        this.meteredResults = this.meteredEnergyService.meteredFuel(this.phast.meteredEnergy.meteredEnergyFuel, this.phast, this.settings);
      } if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.designedEnergyFuel(this.phast.designedEnergy.designedEnergyFuel, this.phast, this.settings);
      }
      if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
        let gas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
        console.log(gas);
      } else if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Volume') {
        let gas = this.suiteDbService.selectGasFlueGasMaterialById(this.phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
        console.log(gas);
      }
    }
    this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);
    console.log(this.baseLineResults);
  }

}
