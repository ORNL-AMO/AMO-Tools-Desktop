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

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService, private phastResultsService: PhastResultsService) { }

  meteredElectricity(input: MeteredEnergyElectricity, phast: PHAST, settings: Settings): MeteredEnergyResults {
    //Metered Energy Use
    //meteredEnergyUsed = Electricity Used during collection / Collection Time
    let meteredEnergyUsed = (input.electricityUsed / input.electricityCollectionTime) || 0;
    //Energy Intensity for Charge Material = meteredEnergyUsed / sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = (meteredEnergyUsed / sumFeedRate) || 0;
    //Electricity Used (Auxiliary) = Electricity used during collection (aux) / collection time (aux)
    let meteredElectricityUsed = (input.auxElectricityUsed / input.auxElectricityCollectionTime) || 0;

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

  meteredFuel(inputs: MeteredEnergyFuel, phast: PHAST, settings: Settings): MeteredEnergyResults {
    //Metered Energy Use
    //Metered Fuel Used = HHV * Flow Rate (if flow rate given)
    let meteredEnergyUsed = inputs.fuelEnergy;
    //Energy Intensity for Charge Materials =  Metered Energy Used / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = (meteredEnergyUsed / sumFeedRate) || 0;
    //Electricity Used (Auxiliary) = Electricity used during collection / collection time
    let meteredElectricityUsed = (inputs.electricityUsed / inputs.electricityCollectionTime) || 0;

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

  meteredSteam(inputs: MeteredEnergySteam, phast: PHAST, settings: Settings): MeteredEnergyResults {
    //Metered Energy Use
    //Metered Fuel Used = HHV * Flow Rate
    let meteredEnergyUsed = inputs.totalHeatSteam * inputs.flowRate;
    //Energy Intensity for Charge Materials =  Metered Energy Used / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = (meteredEnergyUsed / sumFeedRate) || 0;
    //Electricity Used (Auxiliary) = Electricity used during collection / collection time
    let meteredElectricityUsed = (inputs.electricityUsed / inputs.electricityCollectionTime) || 0;

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

}
