import { Injectable } from '@angular/core';
import { MeteredEnergyResults, MeteredEnergyElectricity, MeteredEnergyFuel, MeteredEnergySteam } from '../../shared/models/phast/meteredEnergy';
import { AuxEquipmentService } from '../aux-equipment/aux-equipment.service';
import { PhastService } from '../phast.service';
import { PHAST } from '../../shared/models/phast/phast';
@Injectable()
export class MeteredEnergyService {

  constructor(private auxEquipmentService: AuxEquipmentService, private phastService: PhastService) { }

  meteredElectricity(input: MeteredEnergyElectricity): MeteredEnergyResults {
    let tmpResults: MeteredEnergyResults = {
      meteredEnergyUsed: 0,
      meteredEnergyIntensity: 0,
      meteredElectricityUsed: 0,
      calculatedFuelEnergyUsed: 0,
      calculatedEnergyIntensity: 0,
      calculatedElectricityUsed: 0
    }
    return tmpResults;
  }

  meteredFuel(inputs: MeteredEnergyFuel, phast: PHAST): MeteredEnergyResults {
    //Metered Energy Use
    //Metered Fuel Used = HHV * Flow Rate
    let meteredEnergyUsed = inputs.heatingValue * inputs.flowRate;
    //Energy Intensity for Charge Materials =  Metered Energy Used / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let meteredEnergyIntensity = meteredEnergyUsed / sumFeedRate;
    //Electricity Used (Auxiliary) = Electricity used during collection / collection time
    let meteredElectricityUsed = inputs.electricityUsed / inputs.electricityCollectionTime;

    //Calculated By PHAST
    //Fuel energy used
    let calculatedFuelEnergyUsed = this.phastService.sumHeatInput(phast.losses);
    //energy intensity = fuel energy used / sum(charge material feed rate)
    let calculatedEnergyIntensity = calculatedFuelEnergyUsed / sumFeedRate;
    //TODO aux equipment results

    let tmpResults: MeteredEnergyResults = {
      meteredEnergyUsed: meteredEnergyUsed,
      meteredEnergyIntensity: meteredEnergyIntensity,
      meteredElectricityUsed: meteredElectricityUsed,
      calculatedFuelEnergyUsed: calculatedFuelEnergyUsed,
      calculatedEnergyIntensity: calculatedEnergyIntensity,
      calculatedElectricityUsed: 0
    }
    return tmpResults;
  }

  meteredSteam(inputs: MeteredEnergySteam): MeteredEnergyResults {
    let tmpResults: MeteredEnergyResults = {
      meteredEnergyUsed: 0,
      meteredEnergyIntensity: 0,
      meteredElectricityUsed: 0,
      calculatedFuelEnergyUsed: 0,
      calculatedEnergyIntensity: 0,
      calculatedElectricityUsed: 0
    }
    return tmpResults;
  }

}
