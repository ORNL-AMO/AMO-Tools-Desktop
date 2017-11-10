import { Injectable } from '@angular/core';
import { MeteredEnergyResults, MeteredEnergyElectricity, MeteredEnergyFuel, MeteredEnergySteam } from '../../shared/models/phast/meteredEnergy';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { PhastService } from '../phast.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastResultsService } from '../phast-results.service';
@Injectable()
export class MeteredEnergyService {

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService) { }

  meteredElectricity(input: MeteredEnergyElectricity, phast: PHAST, settings: Settings): MeteredEnergyResults {
    //Metered Energy Use
    //meteredEnergyUsed = Electricity Used during collection / Collection Time
    let meteredEnergyUsed = this.calcElectricityUsed(input);
    //Energy Intensity for Charge Material = meteredEnergyUsed / sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = (meteredEnergyUsed / sumFeedRate) || 0;
    //Electricity Used (Auxiliary) = Electricity used during collection (aux) / collection time (aux)
    let meteredElectricityUsed = (input.auxElectricityUsed / input.auxElectricityCollectionTime) || 0;
   
    meteredEnergyUsed = this.convertResult(meteredEnergyUsed, settings);
    meteredEnergyIntensity = this.convertResult(meteredEnergyIntensity, settings);
    //Calculated by PHAST
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);

    let tmpResults: MeteredEnergyResults = {
      meteredEnergyUsed: meteredEnergyUsed,
      meteredEnergyIntensity: meteredEnergyIntensity,
      meteredElectricityUsed: meteredElectricityUsed,
      calculatedFuelEnergyUsed: calculated.fuelEnergyUsed,
      calculatedEnergyIntensity: calculated.energyIntensity,
      calculatedElectricityUsed: calculated.electricityUsed
    }
    return tmpResults;
  }

  calcElectricityUsed(input: MeteredEnergyElectricity):number{
    return (input.electricityUsed / input.electricityCollectionTime) || 0;
  }

  meteredFuel(inputs: MeteredEnergyFuel, phast: PHAST, settings: Settings): MeteredEnergyResults {
    //Metered Energy Use
    //Metered Fuel Used = HHV * Flow Rate (if flow rate given)
    let meteredEnergyUsed = this.calcFuelUsed(inputs);
    //Energy Intensity for Charge Materials =  Metered Energy Used / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = (meteredEnergyUsed / sumFeedRate) || 0;
    //Electricity Used (Auxiliary) = Electricity used during collection / collection time
    let meteredElectricityUsed = (inputs.electricityUsed / inputs.electricityCollectionTime) || 0;

    meteredEnergyUsed = this.convertResult(meteredEnergyUsed, settings);
    meteredEnergyIntensity = this.convertResult(meteredEnergyIntensity, settings);

    //Calculated By PHAST
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);

    let tmpResults: MeteredEnergyResults = {
      meteredEnergyUsed: meteredEnergyUsed,
      meteredEnergyIntensity: meteredEnergyIntensity,
      meteredElectricityUsed: meteredElectricityUsed,
      calculatedFuelEnergyUsed: calculated.fuelEnergyUsed,
      calculatedEnergyIntensity: calculated.energyIntensity,
      calculatedElectricityUsed: calculated.electricityUsed
    }
    return tmpResults;
  }

  calcFuelUsed(inputs: MeteredEnergyFuel): number {
    return inputs.fuelEnergy  || 0;
  }

  meteredSteam(inputs: MeteredEnergySteam, phast: PHAST, settings: Settings): MeteredEnergyResults {
    //Metered Energy Use
    //Metered Fuel Used = HHV * Flow Rate
    let meteredEnergyUsed = this.calcSteamEnergyUsed(inputs);
    //Energy Intensity for Charge Materials =  Metered Energy Used / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = (meteredEnergyUsed / sumFeedRate) || 0;
    //Electricity Used (Auxiliary) = Electricity used during collection / collection time
    let meteredElectricityUsed = (inputs.electricityUsed / inputs.electricityCollectionTime) || 0;

    meteredEnergyUsed = this.convertResult(meteredEnergyUsed, settings);
    meteredEnergyIntensity = this.convertResult(meteredEnergyIntensity, settings);
    //Calculated By PHAST
    let calculated = this.phastResultsService.calculatedByPhast(phast, settings);

    let tmpResults: MeteredEnergyResults = {
      meteredEnergyUsed: meteredEnergyUsed,
      meteredEnergyIntensity: meteredEnergyIntensity,
      meteredElectricityUsed: meteredElectricityUsed,
      calculatedFuelEnergyUsed: calculated.fuelEnergyUsed,
      calculatedEnergyIntensity: calculated.energyIntensity,
      calculatedElectricityUsed: calculated.electricityUsed
    }
    return tmpResults;
  }

  calcSteamEnergyUsed(inputs: MeteredEnergySteam): number{
    return inputs.totalHeatSteam * inputs.flowRate || 0;
  }
  convertResult(val: number, settings: Settings): number {
    if(settings.energySourceType == 'Electricity'){
      val = this.convertUnitsService.value(val).from('kWh').to(settings.energyResultUnit)
    }else if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }
}
