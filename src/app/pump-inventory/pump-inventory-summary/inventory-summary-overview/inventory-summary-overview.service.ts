import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { FilterInventorySummary, PumpInventoryService } from '../../pump-inventory.service';
import * as _ from 'lodash';
import { PumpInventoryData, PumpInventoryDepartment, PumpItem } from '../../pump-inventory';
import { Co2SavingsData } from '../../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { PsatService } from '../../../psat/psat.service';
import { PsatInputs, PsatOutputs } from '../../../shared/models/psat';
import { HelperFunctionsService } from '../../../shared/helper-services/helper-functions.service';

declare var psatAddon: any;

@Injectable()
export class InventorySummaryOverviewService {

  inventorySummary: BehaviorSubject<InventorySummary>;
  constructor(private pumpInventoryService: PumpInventoryService, private helperFunctionsService: HelperFunctionsService,
    private psatService: PsatService, private assessmentCo2SavingsService: AssessmentCo2SavingsService) {
    this.inventorySummary = new BehaviorSubject<InventorySummary>({
      totalEnergyUse: 0,
      totalEnergyCost: 0,
      totalPumps: 0,
      totalEmissions: 0,
      departmentSummaryItems: new Array()
    });
  }

  setDepartmentSummaryItems() {
    let settings: Settings = this.pumpInventoryService.settings.getValue();
    let departmentSummaryItems: Array<DepartmentSummaryItem> = new Array();
    
    let filterInventorySummary: FilterInventorySummary = this.pumpInventoryService.filterInventorySummary.getValue();
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    let filteredPumpInventoryData: PumpInventoryData = this.pumpInventoryService.filterPumpInventoryData(pumpInventoryData, filterInventorySummary);
    
    let departmentIndex: number = 0;
    filteredPumpInventoryData.departments.forEach(department => {
      let departmentSummary: DepartmentSummaryItem = this.getDepartmentSummary(department, settings, DepartmentRGBColors[departmentIndex]);
      departmentSummaryItems.push(departmentSummary);
      departmentIndex++;
    });
    departmentSummaryItems = _.orderBy(departmentSummaryItems, 'energyCost', 'desc');
    let totalEnergyUse: number = _.sumBy(departmentSummaryItems, 'energyUse');
    let totalCost: number = _.sumBy(departmentSummaryItems, 'energyCost');
    let totalPumps: number = _.sumBy(departmentSummaryItems, 'numberOfPumps');
    let totalEmissions: number = _.sumBy(departmentSummaryItems, 'co2EmissionOutput');
    this.inventorySummary.next({
      totalEnergyCost: totalCost,
      totalEnergyUse: totalEnergyUse,
      totalPumps: totalPumps,
      totalEmissions: totalEmissions,
      departmentSummaryItems: departmentSummaryItems
    });
  }

  getDepartmentSummary(department: PumpInventoryDepartment, settings: Settings, departmentColor: string): DepartmentSummaryItem {
    let energyUse: number = 0;
    let energyCost: number = 0;
    let co2EmissionOutput: number = 0;
    let pumpItemResults: Array<{ data: PumpItem, results: PumpInventoryResults, name: string }> = new Array();
    department.catalog.forEach(pumpItem => {
      let co2SavingsData: Co2SavingsData = this.pumpInventoryService.pumpInventoryData.getValue().co2SavingsData;
      let results: PumpInventoryResults = this.getResults(pumpItem, settings, co2SavingsData);
      pumpItemResults.push({ data: pumpItem, results: results, name: pumpItem.name });

      if (isNaN(results.energyCost) == false) {
        energyCost = energyCost + results.energyCost;
      }
      if (isNaN(results.energyUse) == false) {
        energyUse = energyUse + results.energyUse;
      }
      if (isNaN(results.emissionsOutput) == false) {
        co2EmissionOutput = co2EmissionOutput + results.emissionsOutput;
      }

    });

    pumpItemResults = _.orderBy(pumpItemResults, (pumpItem => {
      return pumpItem.results.energyCost
    }), 'desc');

    return {
      departmentName: department.name,
      numberOfPumps: department.catalog.length,
      energyCost: energyCost,
      energyUse: energyUse,
      co2EmissionOutput: co2EmissionOutput,
      pumpItemResults: pumpItemResults,
      departmentColor: departmentColor
    }
  }


  getDataAndResultsFromPumpItem(pumpItem: PumpItem, settings: Settings): { data: PumpItem, results: PumpInventoryResults } {
    let co2SavingsData: Co2SavingsData = this.pumpInventoryService.pumpInventoryData.getValue().co2SavingsData;
    let pumpInventoryResults: PumpInventoryResults = this.getResults(pumpItem, settings, co2SavingsData);
    return { data: pumpItem, results: pumpInventoryResults };
  }


  getResults(pumpItem: PumpItem, settings: Settings, co2SavingsData?: Co2SavingsData): PumpInventoryResults {
    let results: PumpInventoryResults = {
      energyUse: 0,
      energyCost: 0,
      emissionsOutput: 0,
    };
    if (settings.unitsOfMeasure != 'Imperial') {
      // conversions
      // inputCpy.motorSize = this.convertUnitsService.value(inputCpy.motorSize).from('kW').to('hp');
    }

    // todo had to make educated guesses on these mappings
    let psatInputs: PsatInputs = {
      pump_style: pumpItem.pumpEquipment.pumpType,
      pump_specified: pumpItem.fieldMeasurements.efficiency? pumpItem.fieldMeasurements.efficiency : null,
      pump_rated_speed: pumpItem.pumpEquipment.ratedSpeed,
      drive: pumpItem.systemProperties.driveType,
      kinematic_viscosity: 1.107,
      specific_gravity: 1.002,
      stages: pumpItem.pumpEquipment.numStages,
      fixed_speed: 0,
      line_frequency: pumpItem.pumpMotor.lineFrequency,
      motor_rated_power: pumpItem.pumpMotor.motorRatedPower,
      motor_rated_speed: pumpItem.pumpMotor.motorRPM,
      efficiency_class: pumpItem.pumpMotor.motorEfficiencyClass,
      efficiency: pumpItem.pumpMotor.motorEfficiency,
      motor_rated_voltage: pumpItem.pumpMotor.motorRatedVoltage,
      load_estimation_method: 1,

      motor_rated_fla: pumpItem.pumpMotor.motorFullLoadAmps,
      operating_hours: pumpItem.fieldMeasurements.yearlyOperatingHours,
      flow_rate: pumpItem.fieldMeasurements.operatingFlowRate,
      head: pumpItem.fieldMeasurements.operatingHead,
      //  is motorKW in psat "motor power"
      motor_field_power: pumpItem.fieldMeasurements.measuredPower,
      // in psat motorAmps "Motor Power"
      motor_field_current: pumpItem.fieldMeasurements.measuredCurrent,
      // in psat "measured voltage"
      motor_field_voltage: pumpItem.fieldMeasurements.measuredVoltage,
      cost_kw_hour: settings.electricityCost,
      fluidType: pumpItem.fluid.fluidType,
      fluidTemperature: 68
    };
    let psatResults: PsatOutputs = this.psatService.resultsExisting(psatInputs, settings);
    results.energyUse = psatResults.annual_energy;
    results.energyCost = results.energyUse * settings.electricityCost;
    if (co2SavingsData) {
      co2SavingsData.electricityUse = results.energyUse;
      results.emissionsOutput = this.assessmentCo2SavingsService.getCo2EmissionsResult(co2SavingsData, settings);

    }
    return results;
  }

}


export interface InventorySummary {
  totalEnergyUse: number,
  totalEnergyCost: number,
  totalPumps: number,
  totalEmissions: number,
  departmentSummaryItems: Array<DepartmentSummaryItem>
}

export interface DepartmentSummaryItem {
  departmentName: string;
  numberOfPumps: number;
  energyUse: number;
  energyCost: number;
  departmentColor: string;
  co2EmissionOutput: number,
  pumpItemResults: Array<{ data: PumpItem, results: PumpInventoryResults, name: string }>;
}


export interface PumpInventoryResults {
  energyUse: number;
  emissionOutput?: number;
  energyCost: number;
  emissionsOutput: number;
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