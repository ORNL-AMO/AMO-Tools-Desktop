import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingAssessment, SystemInformation, Operations, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, PumpInput, ChillerInventoryItem, Modification, IncreaseChilledWaterTemp, DecreaseCondenserWaterTemp, UseSlidingCondenserWaterTemp, ProcessCoolingResults, UseFreeCooling, ReplaceChillers, TowerSizeMetric, ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { copyObject, roundVal } from '../../shared/helperFunctions';
import { AppUnits, convertChillerEfficiency, convertFlowRatePerTon, PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { WeatherDataPoint } from '../../shared/weather-api.service';

/**
 * Process Cooling data is stored in the units of the assessment settings.
 * - convertProcessCooling converts saved data in place when the user changes units (rounded for display)
 * - convertInputsForSuite / convertProcessCoolingResults convert at the Suite boundary, which always expects Imperial (unrounded)
 */
@Injectable()
export class ConvertProcessCoolingService {

  convertProcessCooling(processCoolingAssessment: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): ProcessCoolingAssessment {
    processCoolingAssessment = this.convertProcessCoolingAssessmentData(processCoolingAssessment, oldSettings, newSettings, shouldRound);
    if (processCoolingAssessment.modifications) {
      processCoolingAssessment.modifications = processCoolingAssessment.modifications.map(modification => this.convertModification(modification, oldSettings, newSettings, shouldRound));
    }
    return processCoolingAssessment;
  }

  convertProcessCoolingAssessmentData(processCooling: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): ProcessCoolingAssessment {
    processCooling.systemInformation = this.convertSystemInformation(processCooling.systemInformation, oldSettings, newSettings, shouldRound);
    processCooling.inventory = this.convertInventory(processCooling.inventory, oldSettings, newSettings, shouldRound);
    processCooling.weatherData = this.convertWeatherData(processCooling.weatherData, oldSettings, newSettings);
    return processCooling;
  }

  /**
   * Returns an Imperial copy of the assessment for the Suite API. Input is not modified.
   */
  convertInputsForSuite(processCooling: ProcessCoolingAssessment, settings: Settings): ProcessCoolingAssessment {
    const processCoolingCopy: ProcessCoolingAssessment = copyObject(processCooling);
    if (settings.unitsOfMeasure !== 'Metric') {
      return processCoolingCopy;
    }
    const imperialSettings: Settings = { ...settings, unitsOfMeasure: 'Imperial' };
    processCoolingCopy.systemInformation = this.convertSystemInformation(processCoolingCopy.systemInformation, settings, imperialSettings, false);
    processCoolingCopy.inventory = this.convertInventory(processCoolingCopy.inventory, settings, imperialSettings, false);
    return processCoolingCopy;
  }

  convertSystemInformation(systemInformation: SystemInformation, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): SystemInformation {
    if (!systemInformation) return systemInformation;
    systemInformation.operations = this.convertOperations(systemInformation.operations, oldSettings, newSettings, shouldRound);
    systemInformation.airCooledSystemInput = this.convertAirCooledSystemInput(systemInformation.airCooledSystemInput, oldSettings, newSettings, shouldRound);
    systemInformation.waterCooledSystemInput = this.convertWaterCooledSystemInput(systemInformation.waterCooledSystemInput, oldSettings, newSettings, shouldRound);
    systemInformation.towerInput = this.convertTowerInput(systemInformation.towerInput, oldSettings, newSettings, shouldRound);
    systemInformation.chilledWaterPumpInput = this.convertPumpInput(systemInformation.chilledWaterPumpInput, oldSettings, newSettings, shouldRound);
    systemInformation.condenserWaterPumpInput = this.convertPumpInput(systemInformation.condenserWaterPumpInput, oldSettings, newSettings, shouldRound);
    return systemInformation;
  }

  convertOperations(operations: Operations, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): Operations {
    if (!operations) return operations;
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      const convertOne: number = new ConvertValue(1, PROCESS_COOLING_UNITS.fuelCost.metric, PROCESS_COOLING_UNITS.fuelCost.imperial).convertedValue;
      operations.fuelCost = this.round(operations.fuelCost / convertOne, shouldRound, 4);
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      const convertOne: number = new ConvertValue(1, PROCESS_COOLING_UNITS.fuelCost.imperial, PROCESS_COOLING_UNITS.fuelCost.metric).convertedValue;
      operations.fuelCost = this.round(operations.fuelCost / convertOne, shouldRound, 4);
    }
    operations.chilledWaterSupplyTemp = this.convertUnitValue(operations.chilledWaterSupplyTemp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, shouldRound);
    return operations;
  }

  convertAirCooledSystemInput(airCooledSystemInput: AirCooledSystemInput, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): AirCooledSystemInput {
    if (!airCooledSystemInput) return airCooledSystemInput;
    airCooledSystemInput.outdoorAirTemp = this.convertUnitValue(airCooledSystemInput.outdoorAirTemp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, shouldRound);
    airCooledSystemInput.indoorTemp = this.convertUnitValue(airCooledSystemInput.indoorTemp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, shouldRound);
    airCooledSystemInput.followingTempDifferential = this.convertUnitValue(airCooledSystemInput.followingTempDifferential, PROCESS_COOLING_UNITS.temperatureDifference, oldSettings, newSettings, shouldRound);
    return airCooledSystemInput;
  }

  convertWaterCooledSystemInput(waterCooledSystemInput: WaterCooledSystemInput, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): WaterCooledSystemInput {
    if (!waterCooledSystemInput) return waterCooledSystemInput;
    waterCooledSystemInput.condenserWaterTemp = this.convertUnitValue(waterCooledSystemInput.condenserWaterTemp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, shouldRound);
    waterCooledSystemInput.followingTempDifferential = this.convertUnitValue(waterCooledSystemInput.followingTempDifferential, PROCESS_COOLING_UNITS.temperatureDifference, oldSettings, newSettings, shouldRound);
    return waterCooledSystemInput;
  }

  /**
   * towerSize units depend on towerSizeMetric (sized by tons or fan hp), both are kW in Metric
   */
  convertTowerInput(towerInput: TowerInput, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): TowerInput {
    if (!towerInput) return towerInput;
    towerInput.HEXApproachTemp = this.convertUnitValue(towerInput.HEXApproachTemp, PROCESS_COOLING_UNITS.temperatureDifference, oldSettings, newSettings, shouldRound);
    if (towerInput.towerSizeMetric === TowerSizeMetric.Tons) {
      towerInput.towerSize = this.convertUnitValue(towerInput.towerSize, PROCESS_COOLING_UNITS.towerSizeTons, oldSettings, newSettings, shouldRound);
    } else if (towerInput.towerSizeMetric === TowerSizeMetric.HP) {
      towerInput.towerSize = this.convertUnitValue(towerInput.towerSize, PROCESS_COOLING_UNITS.towerSizeHP, oldSettings, newSettings, shouldRound);
    }
    return towerInput;
  }

  convertPumpInput(pumpInput: PumpInput, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): PumpInput {
    if (!pumpInput) return pumpInput;
    if (this.isUnitChange(oldSettings, newSettings)) {
      const toMetric: boolean = newSettings.unitsOfMeasure === 'Metric';
      pumpInput.flowRate = this.round(convertFlowRatePerTon(pumpInput.flowRate, toMetric), shouldRound, 4);
    }
    pumpInput.motorSize = this.convertUnitValue(pumpInput.motorSize, PROCESS_COOLING_UNITS.motorPower, oldSettings, newSettings, shouldRound);
    return pumpInput;
  }

  convertInventory(inventory: Array<ChillerInventoryItem>, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): Array<ChillerInventoryItem> {
    if (!inventory) return inventory;
    return inventory.map(chillerItem => this.convertChillerInventoryItem(chillerItem, oldSettings, newSettings, shouldRound));
  }

  convertChillerInventoryItem(chillerItem: ChillerInventoryItem, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): ChillerInventoryItem {
    if (!chillerItem) return chillerItem;
    chillerItem.capacity = this.convertUnitValue(chillerItem.capacity, PROCESS_COOLING_UNITS.capacity, oldSettings, newSettings, shouldRound);
    if (this.isUnitChange(oldSettings, newSettings)) {
      const toMetric: boolean = newSettings.unitsOfMeasure === 'Metric';
      chillerItem.fullLoadEfficiency = this.round(convertChillerEfficiency(chillerItem.fullLoadEfficiency, toMetric), shouldRound, 4);
      if (chillerItem.kWPerTonAtLoad) {
        chillerItem.kWPerTonAtLoad = chillerItem.kWPerTonAtLoad.map(value => this.round(convertChillerEfficiency(value, toMetric), shouldRound, 4));
      }
    }
    return chillerItem;
  }

  convertModification(modification: Modification, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): Modification {
    if (!modification) return modification;
    modification.increaseChilledWaterTemp = this.convertIncreaseChilledWaterTemp(modification.increaseChilledWaterTemp, oldSettings, newSettings, shouldRound);
    modification.decreaseCondenserWaterTemp = this.convertDecreaseCondenserWaterTemp(modification.decreaseCondenserWaterTemp, oldSettings, newSettings, shouldRound);
    modification.useSlidingCondenserWaterTemp = this.convertUseSlidingCondenserWaterTemp(modification.useSlidingCondenserWaterTemp, oldSettings, newSettings, shouldRound);
    modification.useFreeCooling = this.convertUseFreeCooling(modification.useFreeCooling, oldSettings, newSettings, shouldRound);
    modification.replaceChillers = this.convertReplaceChillers(modification.replaceChillers, oldSettings, newSettings, shouldRound);
    return modification;
  }

  convertIncreaseChilledWaterTemp(increaseChilledWaterTemp: IncreaseChilledWaterTemp, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): IncreaseChilledWaterTemp {
    if (!increaseChilledWaterTemp) return increaseChilledWaterTemp;
    increaseChilledWaterTemp.chilledWaterSupplyTemp = this.convertUnitValue(increaseChilledWaterTemp.chilledWaterSupplyTemp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, shouldRound);
    return increaseChilledWaterTemp;
  }

  convertDecreaseCondenserWaterTemp(decreaseCondenserWaterTemp: DecreaseCondenserWaterTemp, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): DecreaseCondenserWaterTemp {
    if (!decreaseCondenserWaterTemp) return decreaseCondenserWaterTemp;
    decreaseCondenserWaterTemp.condenserWaterTemp = this.convertUnitValue(decreaseCondenserWaterTemp.condenserWaterTemp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, shouldRound);
    return decreaseCondenserWaterTemp;
  }

  convertUseSlidingCondenserWaterTemp(useSlidingCondenserWaterTemp: UseSlidingCondenserWaterTemp, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): UseSlidingCondenserWaterTemp {
    if (!useSlidingCondenserWaterTemp) return useSlidingCondenserWaterTemp;
    useSlidingCondenserWaterTemp.followingTempDifferential = this.convertUnitValue(useSlidingCondenserWaterTemp.followingTempDifferential, PROCESS_COOLING_UNITS.temperatureDifference, oldSettings, newSettings, shouldRound);
    return useSlidingCondenserWaterTemp;
  }

  convertUseFreeCooling(useFreeCooling: UseFreeCooling, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): UseFreeCooling {
    if (!useFreeCooling) return useFreeCooling;
    useFreeCooling.HEXApproachTemp = this.convertUnitValue(useFreeCooling.HEXApproachTemp, PROCESS_COOLING_UNITS.temperatureDifference, oldSettings, newSettings, shouldRound);
    return useFreeCooling;
  }

  convertReplaceChillers(replaceChillers: ReplaceChillers, oldSettings: Settings, newSettings: Settings, shouldRound: boolean = true): ReplaceChillers {
    if (!replaceChillers?.newChiller) return replaceChillers;
    replaceChillers.newChiller = this.convertChillerInventoryItem(replaceChillers.newChiller, oldSettings, newSettings, shouldRound);
    return replaceChillers;
  }

  /**
   * Suite results are Imperial. Power (kW) and energy (kWh) are the same in both unit systems, only chiller efficiency (kW/ton) is converted.
   */
  convertProcessCoolingResults(results: ProcessCoolingResults, settings: Settings): ProcessCoolingResults {
    if (!results || settings.unitsOfMeasure !== 'Metric') return results;
    results.chiller = results.chiller?.map((chillerOutput: ProcessCoolingChillerOutput) => {
      return {
        ...chillerOutput,
        efficiency: chillerOutput.efficiency?.map(value => convertChillerEfficiency(value, true)),
        ariEfficiencyProfile: chillerOutput.ariEfficiencyProfile?.map(value => convertChillerEfficiency(value, true)),
        ariEfficiencyProfileFactored: chillerOutput.ariEfficiencyProfileFactored?.map(value => convertChillerEfficiency(value, true)),
      };
    });
    return results;
  }

  /**
   * Stored weather data points are in F for Imperial settings (as returned by the weather API) and C for Metric settings (converted on fetch)
   */
  convertWeatherData(weatherData: WeatherContextData, oldSettings: Settings, newSettings: Settings): WeatherContextData {
    if (!weatherData?.weatherDataPoints || !this.isUnitChange(oldSettings, newSettings)) return weatherData;
    return {
      ...weatherData,
      weatherDataPoints: weatherData.weatherDataPoints.map((dataPoint: WeatherDataPoint) => {
        return {
          ...dataPoint,
          dry_bulb_temp: this.convertUnitValue(dataPoint.dry_bulb_temp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, false),
          wet_bulb_temp: this.convertUnitValue(dataPoint.wet_bulb_temp, PROCESS_COOLING_UNITS.temperature, oldSettings, newSettings, false),
        }
      })
    };
  }

  // * Suite API always expects Fahrenheit
  convertWeatherDataForSuiteApi(weatherData: WeatherContextData, settings: Settings): WeatherContextData {
    if (settings.unitsOfMeasure !== 'Metric') return weatherData;
    return this.convertWeatherData(weatherData, settings, { ...settings, unitsOfMeasure: 'Imperial' });
  }

  private isUnitChange(oldSettings: Settings, newSettings: Settings): boolean {
    return (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial')
      || (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric');
  }

  private convertUnitValue(value: number, units: AppUnits, oldSettings: Settings, newSettings: Settings, shouldRound: boolean): number {
    if (value === undefined || value === null) return value;
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      value = new ConvertValue(value, units.metric, units.imperial).convertedValue;
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      value = new ConvertValue(value, units.imperial, units.metric).convertedValue;
    }
    return this.round(value, shouldRound, 2);
  }

  private round(value: number, shouldRound: boolean, places: number): number {
    if (!shouldRound || value === undefined || value === null) return value;
    return roundVal(value, places);
  }
}
