import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../compressed-air-inventory.service';
import { CompressedAirInventoryData, CompressedAirItem } from '../../compressed-air-inventory';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import _ from 'lodash';
@Injectable()
export class CompressedAirInventorySummaryOverviewService {
  inventorySummary: BehaviorSubject<InventorySummary>;

  constructor(
    private compressedAirInventoryService: CompressedAirInventoryService,
    private convertUnitsService: ConvertUnitsService
  ) {
    this.inventorySummary = new BehaviorSubject<InventorySummary>({
      totalEnergyUse: 0,
      totalEnergyCost: 0,
      totalCompressors: 0,
      totalEmissions: 0,
      systemSummaryItems: new Array()
    });
  }


  setSystemSummaryItems() {
    let systemSummaryItems: Array<SystemSummaryItem> = new Array();

    let settings: Settings = this.compressedAirInventoryService.settings.getValue();

    let filterInventorySummary: FilterInventorySummary = this.compressedAirInventoryService.filterInventorySummary.getValue();
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    let filteredCompressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.filterCompressedAirInventoryData(compressedAirInventoryData, filterInventorySummary);

    filteredCompressedAirInventoryData.systems.forEach(system => {
      let systemSummaryItem: SystemSummaryItem = {
        systemName: system.name,
        numberOfCompressors: system.catalog.length,
        energyUse: 0,
        energyCost: 0,
        systemColor: SystemRGBColors[Number(system.id) % SystemRGBColors.length],
        co2EmissionOutput: 0,
        compressedAirItemResults: new Array()
      };
      system.catalog.forEach(compressedAirItem => {
        let results = this.getCompressedAirItemResults(compressedAirItem, filteredCompressedAirInventoryData, system.operatingHours, settings);
        systemSummaryItem.energyUse += results.energyUse;
        systemSummaryItem.energyCost += results.energyCost;
        systemSummaryItem.co2EmissionOutput += results.emissionsOutput;
        systemSummaryItem.compressedAirItemResults.push({ data: compressedAirItem, results: results, name: compressedAirItem.name });
      });
      systemSummaryItems.push(systemSummaryItem);
    });

    systemSummaryItems = _.orderBy(systemSummaryItems, 'energyCost', 'desc');
    let totalEnergyUse: number = _.sumBy(systemSummaryItems, 'energyUse');
    let totalCost: number = _.sumBy(systemSummaryItems, 'energyCost');
    let totalCompressors: number = _.sumBy(systemSummaryItems, 'numberOfCompressors');
    let totalEmissions: number = _.sumBy(systemSummaryItems, 'co2EmissionOutput');
    this.inventorySummary.next({
      totalEnergyCost: totalCost,
      totalEnergyUse: totalEnergyUse,
      totalCompressors: totalCompressors,
      totalEmissions: totalEmissions,
      systemSummaryItems: systemSummaryItems
    });
  }


  getCompressedAirItemResults(compressedAirItem: CompressedAirItem, compressedAirInventoryData: CompressedAirInventoryData, operatingHours: number, settings: Settings): CompressedAirItemResults {
    let results: CompressedAirItemResults = {
      energyUse: 0,
      energyCost: 0,
      emissionsOutput: 0,
    };

    let compressorType: number = compressedAirItem.nameplateData.compressorType;
    let controlType: number = compressedAirItem.compressedAirControlsProperties.controlType;
    // Calculate results based on the compressedAirItem properties
    let power: number = compressedAirItem.compressedAirMotor.motorPower;
    if (settings.unitsOfMeasure == 'Imperial') {
      power = this.convertUnitsService.value(power).from('hp').to('kW');
    }    
    let percentTimeLoaded: number = compressedAirItem.compressedAirDesignDetailsProperties.estimatedTimeLoaded / 100;
    let emissionsFactor: number = compressedAirInventoryData.co2SavingsData.totalEmissionOutputRate;
    let efficiency: number = compressedAirItem.compressedAirDesignDetailsProperties.designEfficiency / 100;
    
    let percentUnloadPower: number = 0;
    let averageLoadFactor: number = 1;

    if (controlType == 11) {
      averageLoadFactor = compressedAirItem.compressedAirDesignDetailsProperties.averageLoadFactor;
      efficiency = compressedAirItem.compressedAirDesignDetailsProperties.motorEfficiencyAtLoad / 100;
    }

    let usingPercentUnloadPower = this.checkDisplayNoLoadPowerUL(compressorType, controlType);    
    if (usingPercentUnloadPower) {
      percentUnloadPower = compressedAirItem.compressedAirDesignDetailsProperties.noLoadPowerUL / 100;
    }

    results.energyUse = (power * percentTimeLoaded * averageLoadFactor + percentUnloadPower * power * (1 - percentTimeLoaded)) * operatingHours / efficiency;

    results.emissionsOutput = results.energyUse * emissionsFactor;

    results.energyCost = results.energyUse * settings.electricityCost;

    return results;
  }


  checkDisplayNoLoadPowerUL(compressorType: number, controlType: number): boolean {
    let showNoLoad: boolean = this.checkShowNoLoadPerformancePoint(compressorType, controlType)
    if (showNoLoad) {
      if (controlType != 1 && controlType != 6) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkShowNoLoadPerformancePoint(compressorType: number, controlType: number): boolean {
    if (compressorType == 6) {
      if (controlType == 7 || controlType == 9) {
        return false;
      }
    }
    return true;
  }
  

}


export interface InventorySummary {
  totalEnergyUse: number,
  totalEnergyCost: number,
  totalCompressors: number,
  totalEmissions: number,
  systemSummaryItems: Array<SystemSummaryItem>
}

export interface SystemSummaryItem {
  systemName: string;
  numberOfCompressors: number;
  energyUse: number;
  energyCost: number;
  systemColor: string;
  co2EmissionOutput: number,
  compressedAirItemResults: Array<{ data: CompressedAirItem, results: CompressedAirItemResults, name: string }>;
}


export interface CompressedAirItemResults {
  energyUse: number;
  energyCost: number;
  emissionsOutput: number;
}

export const SystemRGBColors: Array<string> = [
  '33, 97, 140',
  '17, 122, 101',
  '185, 119, 14',
  '123, 125, 125',
  '40, 55, 71',
  '231, 76, 60',
  '46, 204, 113',
  '2, 136, 209',
  '255, 87, 34',
]