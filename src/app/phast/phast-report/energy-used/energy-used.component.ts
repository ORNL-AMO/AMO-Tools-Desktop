import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PHAST, PhastResults, CalculatedByPhast } from '../../../shared/models/phast/phast';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { MeteredEnergyService } from '../../metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../designed-energy/designed-energy.service';
import { PhastResultsService } from '../../phast-results.service';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import { PhastService } from '../../phast.service';
import * as _ from 'lodash';
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

  calculatedResults: CalculatedByPhast = {
    fuelEnergyUsed: 0,
    energyIntensity: 0,
    electricityUsed: 0
  }

  baseLineResults: PhastResults;
  fuelHeatingValue: number = 0;
  steamHeatingValue: number = 0;
  fuelName: string;
  electricEnergyUsed: number = 0;
  fuelEnergyUsed: number = 0;
  steamEnergyUsed: number = 0;

  energyPerMassUnit: string = 'BTU/lb';
  energyPerTimeUnit: string = 'BTU/hr';
  energyCostUnit: string = '/MMBTU';
  constructor(private designedEnergyService: DesignedEnergyService, private meteredEnergyService: MeteredEnergyService, private phastResultsService: PhastResultsService, private suiteDbService: SuiteDbService, private phastService: PhastService) { }

  ngOnInit() {
    let tmpResults = this.phastResultsService.getResults(this.phast, this.settings);
    this.calculatedResults = this.phastResultsService.calculatedByPhast(this.phast, this.settings);
    
    if (this.settings.energySourceType == 'Steam') {
      this.steamEnergyUsed = tmpResults.grossHeatInput;
      if (this.phast.meteredEnergy) {
        this.meteredResults = this.meteredEnergyService.meteredSteam(this.phast.meteredEnergy.meteredEnergySteam, this.phast, this.settings);
        this.steamHeatingValue = this.phast.meteredEnergy.meteredEnergySteam.totalHeatSteam;
      } if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.designedEnergySteam(this.phast.designedEnergy.designedEnergySteam, this.phast, this.settings);
        if (!this.steamHeatingValue) {
          let hhvSum = _.sumBy(this.phast.designedEnergy.designedEnergySteam, 'totalHeat')
          this.steamHeatingValue = hhvSum / this.phast.designedEnergy.designedEnergySteam.length;
        }
      }
    } else if (this.settings.energySourceType == 'Electricity') {
      this.electricEnergyUsed = tmpResults.grossHeatInput;
      if (this.phast.meteredEnergy) {
        this.meteredResults = this.meteredEnergyService.meteredElectricity(this.phast.meteredEnergy.meteredEnergyElectricity, this.phast, this.settings);
      } if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.designedEnergyElectricity(this.phast.designedEnergy.designedEnergyElectricity, this.phast, this.settings);
      }
    } else if (this.settings.energySourceType == 'Fuel') {
      this.fuelEnergyUsed = tmpResults.grossHeatInput;
      if (this.phast.meteredEnergy) {
        this.meteredResults = this.meteredEnergyService.meteredFuel(this.phast.meteredEnergy.meteredEnergyFuel, this.phast, this.settings);
      } if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.designedEnergyFuel(this.phast.designedEnergy.designedEnergyFuel, this.phast, this.settings);
      }
      if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
        let gas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
        this.fuelHeatingValue = gas.heatingValue;
        this.fuelName = gas.substance;
      } else if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Volume') {
        let gas = this.suiteDbService.selectGasFlueGasMaterialById(this.phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
        this.fuelHeatingValue = gas.heatingValue;
        this.fuelName = gas.substance;
      }
    }
    this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);

    if(this.settings.unitsOfMeasure == 'Metric'){
      this.energyPerMassUnit = 'kJ/kg';
      this.energyPerTimeUnit = 'kJ/hr';
      this.energyCostUnit = '/GJ';
    }
  }

}
