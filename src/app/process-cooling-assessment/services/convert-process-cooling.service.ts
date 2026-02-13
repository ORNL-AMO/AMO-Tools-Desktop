import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingAssessment, SystemInformation, Operations, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, PumpInput, ChillerInventoryItem, Modification, IncreaseChilledWaterTemp, DecreaseCondenserWaterTemp, UseSlidingCondenserWaterTemp, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { roundVal } from '../../shared/helperFunctions';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { WeatherDataPoint } from '../../shared/weather-api.service';

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
      const convertOne: number = new ConvertValue(1, PROCESS_COOLING_UNITS.fuelCost.metric, PROCESS_COOLING_UNITS.fuelCost.imperial).convertedValue;
      operations.fuelCost = roundVal(operations.fuelCost / convertOne, 4);
      operations.chilledWaterSupplyTemp = new ConvertValue(operations.chilledWaterSupplyTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const convertOne: number = new ConvertValue(1, PROCESS_COOLING_UNITS.fuelCost.imperial, PROCESS_COOLING_UNITS.fuelCost.metric).convertedValue;
      operations.fuelCost = roundVal(operations.fuelCost / convertOne, 4);
      operations.chilledWaterSupplyTemp = new ConvertValue(operations.chilledWaterSupplyTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
    }
    
    operations.chilledWaterSupplyTemp = roundVal(operations.chilledWaterSupplyTemp, 2);
    return operations;
  }

  convertAirCooledSystemInput(airCooledSystemInput: AirCooledSystemInput, oldSettings: Settings, newSettings: Settings): AirCooledSystemInput {
    if (!airCooledSystemInput) return airCooledSystemInput;
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      airCooledSystemInput.outdoorAirTemp = new ConvertValue(airCooledSystemInput.outdoorAirTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
      airCooledSystemInput.indoorTemp = new ConvertValue(airCooledSystemInput.indoorTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
      airCooledSystemInput.followingTempDifferential = new ConvertValue(airCooledSystemInput.followingTempDifferential, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      airCooledSystemInput.outdoorAirTemp = new ConvertValue(airCooledSystemInput.outdoorAirTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
      airCooledSystemInput.indoorTemp = new ConvertValue(airCooledSystemInput.indoorTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
      airCooledSystemInput.followingTempDifferential = new ConvertValue(airCooledSystemInput.followingTempDifferential, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
    }
    
    airCooledSystemInput.outdoorAirTemp = roundVal(airCooledSystemInput.outdoorAirTemp, 2);
    airCooledSystemInput.indoorTemp = roundVal(airCooledSystemInput.indoorTemp, 2);
    airCooledSystemInput.followingTempDifferential = roundVal(airCooledSystemInput.followingTempDifferential, 2);
    
    return airCooledSystemInput;
  }

  convertWaterCooledSystemInput(waterCooledSystemInput: WaterCooledSystemInput, oldSettings: Settings, newSettings: Settings): WaterCooledSystemInput {
    if (!waterCooledSystemInput) return waterCooledSystemInput;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      waterCooledSystemInput.condenserWaterTemp = new ConvertValue(waterCooledSystemInput.condenserWaterTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
      waterCooledSystemInput.followingTempDifferential = new ConvertValue(waterCooledSystemInput.followingTempDifferential, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {      
      waterCooledSystemInput.condenserWaterTemp = new ConvertValue(waterCooledSystemInput.condenserWaterTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
      waterCooledSystemInput.followingTempDifferential = new ConvertValue(waterCooledSystemInput.followingTempDifferential, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
    }
    
    waterCooledSystemInput.condenserWaterTemp = roundVal(waterCooledSystemInput.condenserWaterTemp, 2);
    waterCooledSystemInput.followingTempDifferential = roundVal(waterCooledSystemInput.followingTempDifferential, 2);
    
    return waterCooledSystemInput;
  }

  /**
   * towerSize is a unique case where the unit is not strictly imperial vs metric, but is set by the user. It does not need conversion
   */
  convertTowerInput(towerInput: TowerInput, oldSettings: Settings, newSettings: Settings): TowerInput {
    if (!towerInput) return towerInput;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      towerInput.HEXApproachTemp = new ConvertValue(towerInput.HEXApproachTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      towerInput.HEXApproachTemp = new ConvertValue(towerInput.HEXApproachTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue; 
    }
    
    towerInput.HEXApproachTemp = roundVal(towerInput.HEXApproachTemp, 2);
    
    return towerInput;
  }

  convertPumpInput(pumpInput: PumpInput, oldSettings: Settings, newSettings: Settings, pumpName: string): PumpInput {
    if (!pumpInput) return pumpInput;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      // todo flowRate awaiting proper unit
      pumpInput.flowRate = new ConvertValue(pumpInput.flowRate, PROCESS_COOLING_UNITS.volumeFlowRate.metric, PROCESS_COOLING_UNITS.volumeFlowRate.imperial).convertedValue;
      pumpInput.motorSize = new ConvertValue(pumpInput.motorSize, PROCESS_COOLING_UNITS.power.metric, PROCESS_COOLING_UNITS.power.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      pumpInput.flowRate = new ConvertValue(pumpInput.flowRate, PROCESS_COOLING_UNITS.volumeFlowRate.imperial, PROCESS_COOLING_UNITS.volumeFlowRate.metric).convertedValue;
      pumpInput.motorSize = new ConvertValue(pumpInput.motorSize, PROCESS_COOLING_UNITS.power.imperial, PROCESS_COOLING_UNITS.power.metric).convertedValue;
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
      chillerItem.capacity = new ConvertValue(chillerItem.capacity, PROCESS_COOLING_UNITS.capacity.metric, PROCESS_COOLING_UNITS.capacity.imperial).convertedValue;
      // todo full load efficiency conversion when we have definition for units
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      chillerItem.capacity = new ConvertValue(chillerItem.capacity, PROCESS_COOLING_UNITS.capacity.imperial, PROCESS_COOLING_UNITS.capacity.metric).convertedValue;
    }
    
    chillerItem.capacity = roundVal(chillerItem.capacity, 2);
    return chillerItem;
  }

  convertModification(modification: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    if (!modification) return modification;

    modification.increaseChilledWaterTemp = this.convertIncreaseChilledWaterTemp(modification.increaseChilledWaterTemp, oldSettings, newSettings);
    modification.decreaseCondenserWaterTemp = this.convertDecreaseCondenserWaterTemp(modification.decreaseCondenserWaterTemp, oldSettings, newSettings);
    modification.useSlidingCondenserWaterTemp = this.convertUseSlidingCondenserWaterTemp(modification.useSlidingCondenserWaterTemp, oldSettings, newSettings);
    // todo EEM conversions 8149
    
    return modification;
  }

  convertIncreaseChilledWaterTemp(increaseChilledWaterTemp: IncreaseChilledWaterTemp, oldSettings: Settings, newSettings: Settings): IncreaseChilledWaterTemp {
    if (!increaseChilledWaterTemp) return increaseChilledWaterTemp;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      increaseChilledWaterTemp.chilledWaterSupplyTemp = new ConvertValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      increaseChilledWaterTemp.chilledWaterSupplyTemp = new ConvertValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
    }
    
    increaseChilledWaterTemp.chilledWaterSupplyTemp = roundVal(increaseChilledWaterTemp.chilledWaterSupplyTemp, 2);
    return increaseChilledWaterTemp;
  }

  convertDecreaseCondenserWaterTemp(decreaseCondenserWaterTemp: DecreaseCondenserWaterTemp, oldSettings: Settings, newSettings: Settings): DecreaseCondenserWaterTemp {
    if (!decreaseCondenserWaterTemp) return decreaseCondenserWaterTemp;
    
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      decreaseCondenserWaterTemp.condenserWaterTemp = new ConvertValue(decreaseCondenserWaterTemp.condenserWaterTemp, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      decreaseCondenserWaterTemp.condenserWaterTemp = new ConvertValue(decreaseCondenserWaterTemp.condenserWaterTemp, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
    }
    
    decreaseCondenserWaterTemp.condenserWaterTemp = roundVal(decreaseCondenserWaterTemp.condenserWaterTemp, 2);
    return decreaseCondenserWaterTemp;
  }

  convertUseSlidingCondenserWaterTemp(useSlidingCondenserWaterTemp: UseSlidingCondenserWaterTemp, oldSettings: Settings, newSettings: Settings): UseSlidingCondenserWaterTemp {
    if (!useSlidingCondenserWaterTemp) return useSlidingCondenserWaterTemp;

    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      useSlidingCondenserWaterTemp.followingTempDifferential = new ConvertValue(useSlidingCondenserWaterTemp.followingTempDifferential, PROCESS_COOLING_UNITS.temperature.metric, PROCESS_COOLING_UNITS.temperature.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      useSlidingCondenserWaterTemp.followingTempDifferential = new ConvertValue(useSlidingCondenserWaterTemp.followingTempDifferential, PROCESS_COOLING_UNITS.temperature.imperial, PROCESS_COOLING_UNITS.temperature.metric).convertedValue;
    }
    
    useSlidingCondenserWaterTemp.followingTempDifferential = roundVal(useSlidingCondenserWaterTemp.followingTempDifferential, 2);
    return useSlidingCondenserWaterTemp;
  }

  convertProcessCoolingResults(results: ProcessCoolingResults, oldSettings: Settings, newSettings: Settings): ProcessCoolingResults {
    if (!results) return results;
  }

  convertWeatherDataForSuiteApi(weatherData: WeatherContextData, settings: Settings): WeatherContextData {
    if (settings.unitsOfMeasure !== 'Imperial') {
      const convertedWeatherDataPoints = weatherData.weatherDataPoints.map((dataPoint: WeatherDataPoint) => {
        return {
          ...dataPoint,
          dry_bulb_temp: new ConvertValue(dataPoint.dry_bulb_temp, 'C', 'F').convertedValue,
          wet_bulb_temp: new ConvertValue(dataPoint.wet_bulb_temp, 'C', 'F').convertedValue,
        }
      });

      return {
        ...weatherData,
        weatherDataPoints: convertedWeatherDataPoints
      }
    }
    return weatherData;
  }

  
}
