import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MotorInventoryService } from '../../motor-inventory.service';
import { BatchAnalysisService } from '../../batch-analysis/batch-analysis.service';
import * as _ from 'lodash';
import { MotorInventoryDepartment } from '../../motor-inventory';
import { Settings } from '../../../shared/models/settings';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';
@Injectable()
export class InventorySummaryOverviewService {

  inventorySummary: BehaviorSubject<InventorySummary>;
  constructor(private motorInventoryService: MotorInventoryService, private batchAnalysisService: BatchAnalysisService) {
    this.inventorySummary = new BehaviorSubject<InventorySummary>({
      totalEnergyUse: 0,
      totalEnergyCost: 0,
      totalMotors: 0,
      totalEmissions: 0,
      departmentSummaryItems: new Array()
    });
  }

  setDepartmentSummaryItems() {
    let filterInventorySummary = this.motorInventoryService.filterInventorySummary.getValue();
    let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    let filteredMotorInventoryData = this.motorInventoryService.filterMotorInventoryData(motorInventoryData, filterInventorySummary);
    let settings: Settings = this.motorInventoryService.settings.getValue();
    let departmentSummaryItems: Array<DepartmentSummaryItem> = new Array();
    let departmentIndex: number = 0;
    filteredMotorInventoryData.departments.forEach(department => {
      let departmentSummary: DepartmentSummaryItem = this.getDepartmentSummary(department, settings, DepartmentRGBColors[departmentIndex]);
      departmentSummaryItems.push(departmentSummary);
      departmentIndex++;
    });
    departmentSummaryItems = _.orderBy(departmentSummaryItems, 'energyCost', 'desc');
    let totalEnergyUse: number = _.sumBy(departmentSummaryItems, 'energyUse');
    let totalCost: number = _.sumBy(departmentSummaryItems, 'energyCost');
    let totalMotors: number = _.sumBy(departmentSummaryItems, 'numberOfMotors');
    let totalEmissions: number = _.sumBy(departmentSummaryItems, 'co2EmissionOutput');
    this.inventorySummary.next({
      totalEnergyCost: totalCost,
      totalEnergyUse: totalEnergyUse,
      totalMotors: totalMotors,
      totalEmissions: totalEmissions,
      departmentSummaryItems: departmentSummaryItems
    })
  }

  getDepartmentSummary(department: MotorInventoryDepartment, settings: Settings, departmentColor: string): DepartmentSummaryItem {
    let energyUse: number = 0;
    let energyCost: number = 0;
    let co2EmissionOutput: number = 0;
    let motorItemResults: Array<{ data: ReplaceExistingData, results: ReplaceExistingResults, name: string }> = new Array();
    department.catalog.forEach(motorItem => {
      let dataAndResults = this.batchAnalysisService.getDataAndResultsFromMotorItem(motorItem, settings);
      motorItemResults.push({ data: dataAndResults.data, results: dataAndResults.results, name: motorItem.name });

      if (isNaN(dataAndResults.results.existingEnergyCost) == false) {
        energyCost = energyCost + dataAndResults.results.existingEnergyCost;
      }
      if (isNaN(dataAndResults.results.existingEnergyUse) == false) {
        energyUse = energyUse + dataAndResults.results.existingEnergyUse;
      }
      if (isNaN(dataAndResults.results.existingEmissionOutput) == false) {
        co2EmissionOutput = co2EmissionOutput + dataAndResults.results.existingEmissionOutput;
      }

    });
    motorItemResults = _.orderBy(motorItemResults, (motorItem => {
      return motorItem.results.existingEnergyCost
    }), 'desc');
    return {
      departmentName: department.name,
      numberOfMotors: department.catalog.length,
      energyCost: energyCost,
      energyUse: energyUse,
      co2EmissionOutput: co2EmissionOutput,
      motorItemResults: motorItemResults,
      departmentColor: departmentColor
    }
  }
}


export interface InventorySummary {
  totalEnergyUse: number,
  totalEnergyCost: number,
  totalMotors: number,
  totalEmissions: number,
  departmentSummaryItems: Array<DepartmentSummaryItem>
}

export interface DepartmentSummaryItem {
  departmentName: string;
  numberOfMotors: number;
  energyUse: number;
  energyCost: number;
  departmentColor: string;
  co2EmissionOutput: number,
  motorItemResults: Array<{ data: ReplaceExistingData, results: ReplaceExistingResults, name: string }>;
}


export const DepartmentRGBColors: Array<string> = [
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