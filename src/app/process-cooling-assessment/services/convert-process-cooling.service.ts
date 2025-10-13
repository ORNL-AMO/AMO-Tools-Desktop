import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingAssessment, SystemInformation, Operations, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, PumpInput, ChillerInventoryItem, Modification, IncreaseChilledWaterTemp, DecreaseCondenserWaterTemp, UseSlidingCondenserWaterTemp, UseFreeCooling, ReplaceChillers, ProcessCoolingChillerOutput, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { roundVal } from '../../shared/helperFunctions';

@Injectable()
export class ConvertProcessCoolingService {


  // TODO remove console.logs after testing
  convertProcessCooling(processCoolingAssessment: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings): ProcessCoolingAssessment {
    console.log('=== Process Cooling Unit Conversion ===');
    console.log(`Converting from ${oldSettings.unitsOfMeasure} to ${newSettings.unitsOfMeasure}`);
    
    processCoolingAssessment = this.convertProcessCoolingAssessmentData(processCoolingAssessment, oldSettings, newSettings);
    if (processCoolingAssessment.modifications) {
      processCoolingAssessment.modifications.forEach((modification, index) => {
        console.log(`\n--- Converting Modification ${index + 1}: ${modification.name} ---`);
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return processCoolingAssessment;
  }

  convertProcessCoolingAssessmentData(processCooling: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings): ProcessCoolingAssessment {
    console.log('\n--- Converting System Information ---');
    processCooling.systemInformation = this.convertSystemInformation(processCooling.systemInformation, oldSettings, newSettings);
    
    console.log('\n--- Converting Chiller Inventory ---');
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
    console.log('\n  Operations conversions:');
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldTemp = operations.chilledWaterSupplyTemp;
      operations.chilledWaterSupplyTemp = new ConvertValue(operations.chilledWaterSupplyTemp, 'C', 'F').convertedValue;
      console.log(`    chilledWaterSupplyTemp: ${oldTemp} C → ${operations.chilledWaterSupplyTemp} F`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldTemp = operations.chilledWaterSupplyTemp;
      operations.chilledWaterSupplyTemp = new ConvertValue(operations.chilledWaterSupplyTemp, 'F', 'C').convertedValue;
      console.log(`    chilledWaterSupplyTemp: ${oldTemp} F → ${operations.chilledWaterSupplyTemp} C`);
    }
    
    operations.chilledWaterSupplyTemp = roundVal(operations.chilledWaterSupplyTemp, 2);
    return operations;
  }

  convertAirCooledSystemInput(airCooledSystemInput: AirCooledSystemInput, oldSettings: Settings, newSettings: Settings): AirCooledSystemInput {
    if (!airCooledSystemInput) return airCooledSystemInput;
    console.log('\n  Air Cooled System Input conversions:');
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldOutdoorTemp = airCooledSystemInput.outdoorAirTemp;
      const oldIndoorTemp = airCooledSystemInput.indoorTemp;
      const oldTempDiff = airCooledSystemInput.followingTempDifferential;
      
      airCooledSystemInput.outdoorAirTemp = new ConvertValue(airCooledSystemInput.outdoorAirTemp, 'C', 'F').convertedValue;
      airCooledSystemInput.indoorTemp = new ConvertValue(airCooledSystemInput.indoorTemp, 'C', 'F').convertedValue;
      airCooledSystemInput.followingTempDifferential = new ConvertValue(airCooledSystemInput.followingTempDifferential, 'C', 'F').convertedValue;
      
      console.log(`    outdoorAirTemp: ${oldOutdoorTemp} C → ${airCooledSystemInput.outdoorAirTemp} F`);
      console.log(`    indoorTemp: ${oldIndoorTemp} C → ${airCooledSystemInput.indoorTemp} F`);
      console.log(`    followingTempDifferential: ${oldTempDiff} C → ${airCooledSystemInput.followingTempDifferential} F`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldOutdoorTemp = airCooledSystemInput.outdoorAirTemp;
      const oldIndoorTemp = airCooledSystemInput.indoorTemp;
      const oldTempDiff = airCooledSystemInput.followingTempDifferential;
      
      airCooledSystemInput.outdoorAirTemp = new ConvertValue(airCooledSystemInput.outdoorAirTemp, 'F', 'C').convertedValue;
      airCooledSystemInput.indoorTemp = new ConvertValue(airCooledSystemInput.indoorTemp, 'F', 'C').convertedValue;
      airCooledSystemInput.followingTempDifferential = new ConvertValue(airCooledSystemInput.followingTempDifferential, 'F', 'C').convertedValue;
      
      console.log(`    outdoorAirTemp: ${oldOutdoorTemp} F → ${airCooledSystemInput.outdoorAirTemp} C`);
      console.log(`    indoorTemp: ${oldIndoorTemp} F → ${airCooledSystemInput.indoorTemp} C`);
      console.log(`    followingTempDifferential: ${oldTempDiff} F → ${airCooledSystemInput.followingTempDifferential} C`);
    }
    
    airCooledSystemInput.outdoorAirTemp = roundVal(airCooledSystemInput.outdoorAirTemp, 2);
    airCooledSystemInput.indoorTemp = roundVal(airCooledSystemInput.indoorTemp, 2);
    airCooledSystemInput.followingTempDifferential = roundVal(airCooledSystemInput.followingTempDifferential, 2);
    
    return airCooledSystemInput;
  }

  convertWaterCooledSystemInput(waterCooledSystemInput: WaterCooledSystemInput, oldSettings: Settings, newSettings: Settings): WaterCooledSystemInput {
    if (!waterCooledSystemInput) return waterCooledSystemInput;

    console.log('\n  Water Cooled System Input conversions:');
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldCondenserTemp = waterCooledSystemInput.condenserWaterTemp;
      const oldTempDiff = waterCooledSystemInput.followingTempDifferential;
      
      waterCooledSystemInput.condenserWaterTemp = new ConvertValue(waterCooledSystemInput.condenserWaterTemp, 'C', 'F').convertedValue;
      waterCooledSystemInput.followingTempDifferential = new ConvertValue(waterCooledSystemInput.followingTempDifferential, 'C', 'F').convertedValue;
      
      console.log(`    condenserWaterTemp: ${oldCondenserTemp} C → ${waterCooledSystemInput.condenserWaterTemp} F`);
      console.log(`    followingTempDifferential: ${oldTempDiff} C → ${waterCooledSystemInput.followingTempDifferential} F`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldCondenserTemp = waterCooledSystemInput.condenserWaterTemp;
      const oldTempDiff = waterCooledSystemInput.followingTempDifferential;
      
      waterCooledSystemInput.condenserWaterTemp = new ConvertValue(waterCooledSystemInput.condenserWaterTemp, 'F', 'C').convertedValue;
      waterCooledSystemInput.followingTempDifferential = new ConvertValue(waterCooledSystemInput.followingTempDifferential, 'F', 'C').convertedValue;
      
      console.log(`    condenserWaterTemp: ${oldCondenserTemp} F → ${waterCooledSystemInput.condenserWaterTemp} C`);
      console.log(`    followingTempDifferential: ${oldTempDiff} F → ${waterCooledSystemInput.followingTempDifferential} C`);
    }
    
    waterCooledSystemInput.condenserWaterTemp = roundVal(waterCooledSystemInput.condenserWaterTemp, 2);
    waterCooledSystemInput.followingTempDifferential = roundVal(waterCooledSystemInput.followingTempDifferential, 2);
    
    return waterCooledSystemInput;
  }

  convertTowerInput(towerInput: TowerInput, oldSettings: Settings, newSettings: Settings): TowerInput {
    if (!towerInput) return towerInput;

    console.log('\n  Tower Input conversions:');
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldHEXTemp = towerInput.HEXApproachTemp;
      const oldTowerSize = towerInput.towerSize;
      
      towerInput.HEXApproachTemp = new ConvertValue(towerInput.HEXApproachTemp, 'C', 'F').convertedValue;
      
      // Convert tower size based on metric: 0 = Tonnes, 1 = HP
      if (towerInput.towerSizeMetric === 0) { // Tonnes to Tons
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'kW', 'tons').convertedValue;
        console.log(`    towerSize: ${oldTowerSize} kW → ${towerInput.towerSize} tons`);
      } else if (towerInput.towerSizeMetric === 1) { // kW to HP
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'kW', 'hp').convertedValue;
        console.log(`    towerSize: ${oldTowerSize} kW → ${towerInput.towerSize} hp`);
      }
      
      console.log(`    HEXApproachTemp: ${oldHEXTemp} C → ${towerInput.HEXApproachTemp} F`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldHEXTemp = towerInput.HEXApproachTemp;
      const oldTowerSize = towerInput.towerSize;
      
      towerInput.HEXApproachTemp = new ConvertValue(towerInput.HEXApproachTemp, 'F', 'C').convertedValue;
      
      // Convert tower size based on metric: 0 = Tonnes, 1 = HP
      if (towerInput.towerSizeMetric === 0) { // Tons to kW
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'tons', 'kW').convertedValue;
        console.log(`    towerSize: ${oldTowerSize} tons → ${towerInput.towerSize} kW`);
      } else if (towerInput.towerSizeMetric === 1) { // HP to kW
        towerInput.towerSize = new ConvertValue(towerInput.towerSize, 'hp', 'kW').convertedValue;
        console.log(`    towerSize: ${oldTowerSize} hp → ${towerInput.towerSize} kW`);
      }
      
      console.log(`    HEXApproachTemp: ${oldHEXTemp} F → ${towerInput.HEXApproachTemp} C`);
    }
    
    towerInput.HEXApproachTemp = roundVal(towerInput.HEXApproachTemp, 2);
    towerInput.towerSize = roundVal(towerInput.towerSize, 2);
    
    return towerInput;
  }

  convertPumpInput(pumpInput: PumpInput, oldSettings: Settings, newSettings: Settings, pumpName: string): PumpInput {
    if (!pumpInput) return pumpInput;

    console.log(`\n  ${pumpName} conversions:`);
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldFlowRate = pumpInput.flowRate;
      const oldMotorSize = pumpInput.motorSize;
      
      // m³/min/kW to gpm/ton
      pumpInput.flowRate = new ConvertValue(pumpInput.flowRate, 'm3', 'gal').convertedValue;
      pumpInput.flowRate = pumpInput.flowRate * new ConvertValue(1, 'kW', 'tons').convertedValue; // Adjust for per-ton vs per-kW
      pumpInput.motorSize = new ConvertValue(pumpInput.motorSize, 'kW', 'hp').convertedValue;
      
      console.log(`    flowRate: ${oldFlowRate} m³/kW → ${pumpInput.flowRate} gpm/ton`);
      console.log(`    motorSize: ${oldMotorSize} kW → ${pumpInput.motorSize} hp`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldFlowRate = pumpInput.flowRate;
      const oldMotorSize = pumpInput.motorSize;
      
      // gpm/ton to m³/min/kW
      pumpInput.flowRate = new ConvertValue(pumpInput.flowRate, 'gal', 'm3').convertedValue;
      pumpInput.flowRate = pumpInput.flowRate / new ConvertValue(1, 'kW', 'tons').convertedValue; // Adjust for per-kW vs per-ton
      pumpInput.motorSize = new ConvertValue(pumpInput.motorSize, 'hp', 'kW').convertedValue;
      
      console.log(`    flowRate: ${oldFlowRate} gpm/ton → ${pumpInput.flowRate} m³/kW`);
      console.log(`    motorSize: ${oldMotorSize} hp → ${pumpInput.motorSize} kW`);
    }
    
    pumpInput.flowRate = roundVal(pumpInput.flowRate, 2);
    pumpInput.motorSize = roundVal(pumpInput.motorSize, 2);
    
    return pumpInput;
  }

  convertInventory(inventory: Array<ChillerInventoryItem>, oldSettings: Settings, newSettings: Settings): Array<ChillerInventoryItem> {
    if (!inventory) return inventory;

    inventory.forEach((chillerItem: ChillerInventoryItem, index) => {
      console.log(`\n  Chiller ${index + 1} (${chillerItem.name}) conversions:`);
      chillerItem = this.convertChillerInventoryItem(chillerItem, oldSettings, newSettings);
    });
    return inventory;
  }

  convertChillerInventoryItem(chillerItem: ChillerInventoryItem, oldSettings: Settings, newSettings: Settings): ChillerInventoryItem {
    if (!chillerItem) return chillerItem;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldCapacity = chillerItem.capacity;
      chillerItem.capacity = new ConvertValue(chillerItem.capacity, 'kW', 'tons').convertedValue;
      console.log(`    capacity: ${oldCapacity} kW → ${chillerItem.capacity} tons`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldCapacity = chillerItem.capacity;
      // chillerItem.capacity = new ConvertValue(chillerItem.capacity, 'ton', 'kW').convertedValue;
      chillerItem.capacity = new ConvertValue(chillerItem.capacity, 'tons', 'kW').convertedValue;
      console.log(`    capacity: ${oldCapacity} tons → ${chillerItem.capacity} kW`);  
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

    console.log('\n  Increase Chilled Water Temp EEM conversions:');
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldTemp = increaseChilledWaterTemp.chilledWaterSupplyTemp;
      increaseChilledWaterTemp.chilledWaterSupplyTemp = new ConvertValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, 'C', 'F').convertedValue;
      console.log(`    chilledWaterSupplyTemp: ${oldTemp} C → ${increaseChilledWaterTemp.chilledWaterSupplyTemp} F`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldTemp = increaseChilledWaterTemp.chilledWaterSupplyTemp;
      increaseChilledWaterTemp.chilledWaterSupplyTemp = new ConvertValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, 'F', 'C').convertedValue;
      console.log(`    chilledWaterSupplyTemp: ${oldTemp} F → ${increaseChilledWaterTemp.chilledWaterSupplyTemp} C`);
    }
    
    increaseChilledWaterTemp.chilledWaterSupplyTemp = roundVal(increaseChilledWaterTemp.chilledWaterSupplyTemp, 2);
    return increaseChilledWaterTemp;
  }

  convertDecreaseCondenserWaterTemp(decreaseCondenserWaterTemp: DecreaseCondenserWaterTemp, oldSettings: Settings, newSettings: Settings): DecreaseCondenserWaterTemp {
    if (!decreaseCondenserWaterTemp) return decreaseCondenserWaterTemp;

    console.log('\n  Decrease Condenser Water Temp EEM conversions:');
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const oldTemp = decreaseCondenserWaterTemp.condenserWaterTemp;
      decreaseCondenserWaterTemp.condenserWaterTemp = new ConvertValue(decreaseCondenserWaterTemp.condenserWaterTemp, 'C', 'F').convertedValue;
      console.log(`    condenserWaterTemp: ${oldTemp} C → ${decreaseCondenserWaterTemp.condenserWaterTemp} F`);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const oldTemp = decreaseCondenserWaterTemp.condenserWaterTemp;
      decreaseCondenserWaterTemp.condenserWaterTemp = new ConvertValue(decreaseCondenserWaterTemp.condenserWaterTemp, 'F', 'C').convertedValue;
      console.log(`    condenserWaterTemp: ${oldTemp} F → ${decreaseCondenserWaterTemp.condenserWaterTemp} C`);
    }
    
    decreaseCondenserWaterTemp.condenserWaterTemp = roundVal(decreaseCondenserWaterTemp.condenserWaterTemp, 2);
    return decreaseCondenserWaterTemp;
  }

  convertProcessCoolingResults(results: ProcessCoolingResults, oldSettings: Settings, newSettings: Settings): ProcessCoolingResults {
    if (!results) return results;
  }
  
}
