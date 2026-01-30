import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingAssessment, SystemInformation, Operations, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, PumpInput, ChillerInventoryItem, Modification, IncreaseChilledWaterTemp, DecreaseCondenserWaterTemp, UseSlidingCondenserWaterTemp, UseFreeCooling, ReplaceChillers, ProcessCoolingChillerOutput, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { roundVal } from '../../shared/helperFunctions';

@Injectable()
export class ConvertProcessCoolingService {


  convertProcessCooling(processCoolingAssessment: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings): ProcessCoolingAssessment {
    processCoolingAssessment = this.convertProcessCoolingAssessmentData(processCoolingAssessment, oldSettings, newSettings);
    if (processCoolingAssessment.modifications) {
      processCoolingAssessment.modifications.forEach((modification, index) => {
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return processCoolingAssessment;
  }

  convertProcessCoolingAssessmentData(processCooling: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings): ProcessCoolingAssessment {
    processCooling.systemInformation = this.convertSystemInformation(processCooling.systemInformation, oldSettings, newSettings);
    processCooling.inventory = this.convertInventory(processCooling.inventory, oldSettings, newSettings);
    return processCooling;
  }

  convertSystemInformation(systemInformation: SystemInformation, oldSettings: Settings, newSettings: Settings): SystemInformation {
    if (!systemInformation) return systemInformation;
    systemInformation.operations = this.convertOperations(systemInformation.operations, oldSettings, newSettings);
    systemInformation.airCooledSystemInput = this.convertAirCooledSystemInput(systemInformation.airCooledSystemInput, oldSettings, newSettings);
    systemInformation.waterCooledSystemInput = this.convertWaterCooledSystemInput(systemInformation.waterCooledSystemInput, oldSettings, newSettings);
    systemInformation.towerInput = this.convertTowerInput(systemInformation.towerInput, oldSettings, newSettings);
    systemInformation.chilledWaterPumpInput = this.convertPumpInput(systemInformation.chilledWaterPumpInput, oldSettings, newSettings, 'Chilled Water Pump');
    systemInformation.condenserWaterPumpInput = this.convertPumpInput(systemInformation.condenserWaterPumpInput, oldSettings, newSettings, 'Condenser Water Pump');
    
    return systemInformation;
  }

  convertOperations(operations: Operations, oldSettings: Settings, newSettings: Settings): Operations {
    if (!operations) return operations;
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const convertOne: number = new ConvertValue(1, 'GJ', 'MMBtu').convertedValue;
      operations.fuelCost = roundVal(operations.fuelCost / convertOne, 4);
      operations.chilledWaterSupplyTemp = new ConvertValue(operations.chilledWaterSupplyTemp, 'C', 'F').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const convertOne: number = new ConvertValue(1, 'MMBtu', 'GJ').convertedValue;
      operations.fuelCost = roundVal(operations.fuelCost / convertOne, 4);
      operations.chilledWaterSupplyTemp = new ConvertValue(operations.chilledWaterSupplyTemp, 'F', 'C').convertedValue;
    }
    
    operations.chilledWaterSupplyTemp = roundVal(operations.chilledWaterSupplyTemp, 2);
    return operations;
  }

  convertAirCooledSystemInput(airCooledSystemInput: AirCooledSystemInput, oldSettings: Settings, newSettings: Settings): AirCooledSystemInput {
    if (!airCooledSystemInput) return airCooledSystemInput;
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      airCooledSystemInput.outdoorAirTemp = new ConvertValue(airCooledSystemInput.outdoorAirTemp, 'C', 'F').convertedValue;
      airCooledSystemInput.indoorTemp = new ConvertValue(airCooledSystemInput.indoorTemp, 'C', 'F').convertedValue;
      airCooledSystemInput.followingTempDifferential = new ConvertValue(airCooledSystemInput.followingTempDifferential, 'C', 'F').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      airCooledSystemInput.outdoorAirTemp = new ConvertValue(airCooledSystemInput.outdoorAirTemp, 'F', 'C').convertedValue;
      airCooledSystemInput.indoorTemp = new ConvertValue(airCooledSystemInput.indoorTemp, 'F', 'C').convertedValue;
      airCooledSystemInput.followingTempDifferential = new ConvertValue(airCooledSystemInput.followingTempDifferential, 'F', 'C').convertedValue;
    }
    
    airCooledSystemInput.outdoorAirTemp = roundVal(airCooledSystemInput.outdoorAirTemp, 2);
    airCooledSystemInput.indoorTemp = roundVal(airCooledSystemInput.indoorTemp, 2);
    airCooledSystemInput.followingTempDifferential = roundVal(airCooledSystemInput.followingTempDifferential, 2);
    
    return airCooledSystemInput;
  }

  convertWaterCooledSystemInput(waterCooledSystemInput: WaterCooledSystemInput, oldSettings: Settings, newSettings: Settings): WaterCooledSystemInput {
    if (!waterCooledSystemInput) return waterCooledSystemInput;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      waterCooledSystemInput.condenserWaterTemp = new ConvertValue(waterCooledSystemInput.condenserWaterTemp, 'C', 'F').convertedValue;
      waterCooledSystemInput.followingTempDifferential = new ConvertValue(waterCooledSystemInput.followingTempDifferential, 'C', 'F').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {      
      waterCooledSystemInput.condenserWaterTemp = new ConvertValue(waterCooledSystemInput.condenserWaterTemp, 'F', 'C').convertedValue;
      waterCooledSystemInput.followingTempDifferential = new ConvertValue(waterCooledSystemInput.followingTempDifferential, 'F', 'C').convertedValue;
    }
    
    waterCooledSystemInput.condenserWaterTemp = roundVal(waterCooledSystemInput.condenserWaterTemp, 2);
    waterCooledSystemInput.followingTempDifferential = roundVal(waterCooledSystemInput.followingTempDifferential, 2);
    
    return waterCooledSystemInput;
  }

  convertTowerInput(towerInput: TowerInput, oldSettings: Settings, newSettings: Settings): TowerInput {
    if (!towerInput) return towerInput;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      towerInput.HEXApproachTemp = new ConvertValue(towerInput.HEXApproachTemp, 'C', 'F').convertedValue;
      
      // Convert tower size based on metric: 0 = Tonnes, 1 = HP
      if (towerInput.towerSizeMetric === 0) { // Tonnes to Tons
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'kW', 'tons').convertedValue;
      } else if (towerInput.towerSizeMetric === 1) { // kW to HP
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'kW', 'hp').convertedValue;
      }
      
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      towerInput.HEXApproachTemp = new ConvertValue(towerInput.HEXApproachTemp, 'F', 'C').convertedValue;
      
      // Convert tower size based on metric: 0 = Tonnes, 1 = HP
      if (towerInput.towerSizeMetric === 0) { // Tons to kW
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'tons', 'kW').convertedValue;
      } else if (towerInput.towerSizeMetric === 1) { // HP to kW
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'hp', 'kW').convertedValue;
      }
      
    }
    
    towerInput.HEXApproachTemp = roundVal(towerInput.HEXApproachTemp, 2);
    towerInput.towerSize = roundVal(towerInput.towerSize, 2);
    
    return towerInput;
  }

  convertPumpInput(pumpInput: PumpInput, oldSettings: Settings, newSettings: Settings, pumpName: string): PumpInput {
    if (!pumpInput) return pumpInput;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      // m³/min/kW to gpm/ton
      pumpInput.flowRate = new ConvertValue(pumpInput.flowRate, 'm3', 'gal').convertedValue;
      pumpInput.flowRate = pumpInput.flowRate * new ConvertValue(1, 'kW', 'tons').convertedValue; // Adjust for per-ton vs per-kW
      pumpInput.motorSize = new ConvertValue(pumpInput.motorSize, 'kW', 'hp').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      // gpm/ton to m³/min/kW
      pumpInput.flowRate = new ConvertValue(pumpInput.flowRate, 'gal', 'm3').convertedValue;
      pumpInput.flowRate = pumpInput.flowRate / new ConvertValue(1, 'kW', 'tons').convertedValue; // Adjust for per-kW vs per-ton
      pumpInput.motorSize = new ConvertValue(pumpInput.motorSize, 'hp', 'kW').convertedValue;
    }
    
    pumpInput.flowRate = roundVal(pumpInput.flowRate, 2);
    pumpInput.motorSize = roundVal(pumpInput.motorSize, 2);
    
    return pumpInput;
  }

  convertInventory(inventory: Array<ChillerInventoryItem>, oldSettings: Settings, newSettings: Settings): Array<ChillerInventoryItem> {
    if (!inventory) return inventory;

    inventory.forEach((chillerItem: ChillerInventoryItem, index) => {
      chillerItem = this.convertChillerInventoryItem(chillerItem, oldSettings, newSettings);
    });
    return inventory;
  }

  convertChillerInventoryItem(chillerItem: ChillerInventoryItem, oldSettings: Settings, newSettings: Settings): ChillerInventoryItem {
    if (!chillerItem) return chillerItem;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      chillerItem.capacity = new ConvertValue(chillerItem.capacity, 'kW', 'tons').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      // chillerItem.capacity = new ConvertValue(chillerItem.capacity, 'ton', 'kW').convertedValue;
      chillerItem.capacity = new ConvertValue(chillerItem.capacity, 'tons', 'kW').convertedValue;
    }
    
    chillerItem.capacity = roundVal(chillerItem.capacity, 2);
    return chillerItem;
  }

  convertModification(modification: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    if (!modification) return modification;

    modification.increaseChilledWaterTemp = this.convertIncreaseChilledWaterTemp(modification.increaseChilledWaterTemp, oldSettings, newSettings);
    modification.decreaseCondenserWaterTemp = this.convertDecreaseCondenserWaterTemp(modification.decreaseCondenserWaterTemp, oldSettings, newSettings);
    // modification.useSlidingCondenserWaterTemp = this.convertUseSlidingCondenserWaterTemp(modification.useSlidingCondenserWaterTemp, oldSettings, newSettings);
    // modification.useFreeCooling = this.convertUseFreeCooling(modification.useFreeCooling, oldSettings, newSettings);
    // modification.replaceChillers = this.convertReplaceChillers(modification.replaceChillers, oldSettings, newSettings);
    
    return modification;
  }

  convertIncreaseChilledWaterTemp(increaseChilledWaterTemp: IncreaseChilledWaterTemp, oldSettings: Settings, newSettings: Settings): IncreaseChilledWaterTemp {
    if (!increaseChilledWaterTemp) return increaseChilledWaterTemp;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      increaseChilledWaterTemp.chilledWaterSupplyTemp = new ConvertValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, 'C', 'F').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      increaseChilledWaterTemp.chilledWaterSupplyTemp = new ConvertValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, 'F', 'C').convertedValue;
    }
    
    increaseChilledWaterTemp.chilledWaterSupplyTemp = roundVal(increaseChilledWaterTemp.chilledWaterSupplyTemp, 2);
    return increaseChilledWaterTemp;
  }

  convertDecreaseCondenserWaterTemp(decreaseCondenserWaterTemp: DecreaseCondenserWaterTemp, oldSettings: Settings, newSettings: Settings): DecreaseCondenserWaterTemp {
    if (!decreaseCondenserWaterTemp) return decreaseCondenserWaterTemp;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      decreaseCondenserWaterTemp.condenserWaterTemp = new ConvertValue(decreaseCondenserWaterTemp.condenserWaterTemp, 'C', 'F').convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      decreaseCondenserWaterTemp.condenserWaterTemp = new ConvertValue(decreaseCondenserWaterTemp.condenserWaterTemp, 'F', 'C').convertedValue;
    }
    
    decreaseCondenserWaterTemp.condenserWaterTemp = roundVal(decreaseCondenserWaterTemp.condenserWaterTemp, 2);
    return decreaseCondenserWaterTemp;
  }

  convertProcessCoolingResults(results: ProcessCoolingResults, oldSettings: Settings, newSettings: Settings): ProcessCoolingResults {
    if (!results) return results;
  }
  
}
