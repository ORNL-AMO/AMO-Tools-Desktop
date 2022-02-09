import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PHAST, PhastResults, CalculatedByPhast } from '../../../shared/models/phast/phast';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { MeteredEnergyService } from '../../metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../designed-energy/designed-energy.service';
import { PhastResultsService } from '../../phast-results.service';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
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
    designed: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      hourlyElectricity: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    },
      byPhast: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    }
  };
  
  meteredResults: MeteredEnergyResults = {
    metered: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      hourlyElectricity: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    },
      byPhast: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    }
  };

  calculatedResults: CalculatedByPhast = {
    fuelEnergyUsed: 0,
    energyIntensity: 0,
    electricityUsed: 0
  };
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

  phastResults: PhastResults;
  constructor(private designedEnergyService: DesignedEnergyService, private meteredEnergyService: MeteredEnergyService, private phastResultsService: PhastResultsService, private suiteDbService: SuiteDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.phastResults = this.phastResultsService.getResults(this.phast, this.settings);
    this.calculatedResults = this.phastResultsService.calculatedByPhast(this.phast, this.settings);
    this.electricityHeatingValue = this.convertUnitsService.value(9800).from('Btu').to(this.settings.energyResultUnit);
    this.getUnits();

    if (this.settings.energySourceType === 'Steam') {
      this.setSteamVals();
    } else if (this.settings.energySourceType === 'Electricity') {
      this.setElectrotechVals();
      this.setFuelVals();
    } else if (this.settings.energySourceType === 'Fuel') {
      this.setFuelVals();
    }

    if (this.phast.designedEnergy) {
      if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.calculateDesignedEnergy(this.phast, this.settings);
      }
    }
  }

  getUnits() {
    if (this.settings.energyResultUnit !== 'kWh' && this.settings.energySourceType !== 'Electricity') {
      this.baseEnergyUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.baseEnergyUnit = this.settings.energyResultUnit;
    }
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.energyCostUnit = '/GJ';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    } else if (this.settings.unitsOfMeasure === 'Imperial') {
      this.energyCostUnit = '/MMBtu';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    }

    if (this.settings.energyResultUnit === 'MMBtu') {
      this.energyPerMassUnit = 'Btu/lb';
    } else if (this.settings.energyResultUnit === 'GJ') {
      this.energyPerMassUnit = 'kJ/kg';
    } else {
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
      } else {
        this.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
      }
    }

  }

  setElectrotechVals() {
    this.electricEnergyUsed = this.phastResults.electricalHeatDelivered;
    if (this.settings.furnaceType === 'Electric Arc Furnace (EAF)') {
      this.electricEnergyUsed = this.phastResults.hourlyEAFResults.electricEnergyUsed; 
    }
    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergyElectricity) {
        this.meteredResults = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
      }
    }
  }

  setSteamVals() {
    this.steamEnergyUsed = this.phastResults.grossHeatInput;
    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergySteam) {
        this.meteredResults = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
        this.steamHeatingValue = this.phast.meteredEnergy.meteredEnergySteam.totalHeatSteam;
      }
    }
  }

  setFuelVals() {
    this.fuelEnergyUsed = this.phastResults.grossHeatInput;
    if (this.settings.energySourceType === 'Electricity') {
      if (this.settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        this.fuelName = 'Natural Gas';
        this.fuelEnergyUsed = this.phastResults.hourlyEAFResults.naturalGasUsed;
        if (this.settings.unitsOfMeasure == 'Imperial') {
          this.energyPerMassUnit = 'Btu/lb';
          this.baseEnergyUnit = 'MMBtu';
        } else {
          this.energyPerMassUnit = 'kJ/kg';
          this.baseEnergyUnit = 'GJ';
        }
      } else {
        this.fuelEnergyUsed = this.phastResults.energyInputHeatDelivered + this.phastResults.totalExhaustGas;
      }
    }

    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergyFuel) {
        this.meteredResults = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
      }
    }

    if (this.phast.losses.flueGasLosses) {
      if (this.phast.losses.flueGasLosses[0].flueGasType === 'By Mass') {
        let gas: SolidLiquidFlueGasMaterial = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
        if (gas) {
          this.fuelHeatingValue = gas.heatingValue;
          this.fuelName = gas.substance;
        }
      } else if (this.phast.losses.flueGasLosses[0].flueGasType === 'By Volume') {
        let gas: FlueGasMaterial = this.suiteDbService.selectGasFlueGasMaterialById(this.phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
        if (gas) {
          this.fuelHeatingValue = gas.heatingValue;
          this.fuelName = gas.substance;
        }
      }
      this.fuelHeatingValue = this.convertResult(this.fuelHeatingValue, this.settings);
    }
  }


  convertResult(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

}
