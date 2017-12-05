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
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
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

  energyPerMassUnit: string;
  energyPerTimeUnit: string;
  energyCostUnit: string;
  fuelUsedUnit: string;
  baseEnergyUnit: string;
  electricityHeatingValue: number;
  constructor(private designedEnergyService: DesignedEnergyService, private meteredEnergyService: MeteredEnergyService, private phastResultsService: PhastResultsService, private suiteDbService: SuiteDbService, private phastService: PhastService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    let tmpResults = this.phastResultsService.getResults(this.phast, this.settings);
    this.calculatedResults = this.phastResultsService.calculatedByPhast(this.phast, this.settings);
    this.electricityHeatingValue = this.convertUnitsService.value(9800).from('Btu').to(this.settings.energyResultUnit);
    this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);
    this.getUnits();

    if (this.settings.energySourceType == 'Steam') {
      this.setSteamVals(tmpResults);
    } else if (this.settings.energySourceType == 'Electricity') {
      this.setElectrotechVals(tmpResults);
    } else if (this.settings.energySourceType == 'Fuel') {
      this.setFuelVals(tmpResults)
    }
  }

  getUnits() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.baseEnergyUnit = this.settings.energyResultUnit + '/hr'
    } else {
      this.baseEnergyUnit = this.settings.energyResultUnit;
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.energyCostUnit = '/GJ';
      this.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.energyCostUnit = '/MMBtu';
      this.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    }
  }

  setElectrotechVals(tmpResults: PhastResults) {
    this.electricEnergyUsed = tmpResults.grossHeatInput;
    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergyElectricity) {
        this.meteredResults = this.meteredEnergyService.meteredElectricity(this.phast.meteredEnergy.meteredEnergyElectricity, this.phast, this.settings);
      }
    } 
    
    if (this.phast.designedEnergy) {
      if (this.phast.designedEnergy.designedEnergyElectricity) {
        this.designedResults = this.designedEnergyService.designedEnergyElectricity(this.phast.designedEnergy.designedEnergyElectricity, this.phast, this.settings);
      }
    }
  }

  setSteamVals(tmpResults: PhastResults) {
    this.steamEnergyUsed = tmpResults.grossHeatInput;
    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergySteam) {
        this.meteredResults = this.meteredEnergyService.meteredSteam(this.phast.meteredEnergy.meteredEnergySteam, this.phast, this.settings);
        this.steamHeatingValue = this.phast.meteredEnergy.meteredEnergySteam.totalHeatSteam;
      }
    } 
    
    if (this.phast.designedEnergy) {
      if (this.phast.designedEnergy.designedEnergySteam) {
        this.designedResults = this.designedEnergyService.designedEnergySteam(this.phast.designedEnergy.designedEnergySteam, this.phast, this.settings);
        if (!this.steamHeatingValue) {
          let hhvSum = _.sumBy(this.phast.designedEnergy.designedEnergySteam, 'totalHeat')
          this.steamHeatingValue = hhvSum / this.phast.designedEnergy.designedEnergySteam.length;
        }
      }
    }
  }

  setFuelVals(tmpResults: PhastResults) {
    this.fuelEnergyUsed = tmpResults.grossHeatInput;
    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergyFuel) {
        this.meteredResults = this.meteredEnergyService.meteredFuel(this.phast.meteredEnergy.meteredEnergyFuel, this.phast, this.settings);
      }
    } 
    
    if (this.phast.designedEnergy) {
      if (this.phast.designedEnergy.designedEnergyFuel) {
        this.designedResults = this.designedEnergyService.designedEnergyFuel(this.phast.designedEnergy.designedEnergyFuel, this.phast, this.settings);
      }
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
    this.fuelHeatingValue = this.convertResult(this.fuelHeatingValue, this.settings);
  }

  convertResult(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

}
