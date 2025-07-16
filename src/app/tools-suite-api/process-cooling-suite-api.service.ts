import { Injectable } from '@angular/core';
import {
  ProcessCoolingAssessment,
  AirCooledSystemInput,
  WaterCooledSystemInput,
  PumpInput,
  TowerInput,
  ProcessCoolingChillerOutput,
  ProcessCoolingPumpOutput,
  ProcessCoolingTowerOutput,
  Operations,
  ChillerInventoryItem
} from '../shared/models/process-cooling-assessment';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  /**
   * Calculates chiller energy for an air-cooled system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   *   - airCooledSystemInput: {chilledWaterSupplyTemp: number (°F), outdoorAirDesignTemp: number (°F), coolingAirSource: number, avgIndoorTemp: number (°F), numChillers: number}
   *   - chillerInput: {capacity: number (tons), efficiency: number (kW/ton), ...}
   *   - processCoolingInput: {systemOperationAnnualHours: IntVector (hours), dryBulbHourlyTemp: DoubleVector (°F), wetBulbHourlyTemp: DoubleVector (°F)}
   * @returns {ProcessCoolingChillerOutput[]} Array of chiller output objects, each with:
   *   - efficiency: number[] (kW/ton)
   *   - hours: number[] (hours)
   *   - power: number[] (kW)
   *   - energy: number[] (kWh)
   */
  runAirCooledChillerEnergy(assessment: ProcessCoolingAssessment): ProcessCoolingChillerOutput[] {
    const chillerInputVector = this._createChillerInputVector(assessment.inventory);
    const airCooledSystemInputInstance = this._createAirCooledSystemInput(assessment.systemInformation.airCooledSystemInput, assessment.systemInformation.operations);
    const processCoolingInstance = this._createProcessCoolingAirCooledInput(
      assessment,
      chillerInputVector,
      airCooledSystemInputInstance
    );

    const chillerOutput = processCoolingInstance.calculateChillerEnergy();
    const result: ProcessCoolingChillerOutput[] = [];
    const numChillers = chillerOutput.efficiency.size();
    for (let i = 0; i < numChillers; i++) {
      result.push({
        efficiency: this._extractArray(chillerOutput.efficiency.get(i)),
        hours: this._extractArray(chillerOutput.hours.get(i)),
        power: this._extractArray(chillerOutput.power.get(i)),
        energy: this._extractArray(chillerOutput.energy.get(i))
      });
    }
    chillerOutput.delete();
    processCoolingInstance.delete();
    chillerInputVector.delete();
    airCooledSystemInputInstance.delete();
    return result;
  }

  /**
   * Calculates chiller energy for a water-cooled system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   *   - waterCooledSystemInput: {chilledWaterSupplyTemp: number (°F), condenserWaterSupplyTemp: number (°F), ...}
   *   - chillerInput: {capacity: number (tons), efficiency: number (kW/ton), ...}
   *   - processCoolingInput: {systemOperationAnnualHours: IntVector (hours), dryBulbHourlyTemp: DoubleVector (°F), wetBulbHourlyTemp: DoubleVector (°F)}
   *   - towerInput: {numTowers: number, ...}
   * @returns {ProcessCoolingChillerOutput[]} Array of chiller output objects, each with:
   *   - efficiency: number[] (kW/ton)
   *   - hours: number[] (hours)
   *   - power: number[] (kW)
   *   - energy: number[] (kWh)
   */
  runWaterCooledChillerEnergy(assessment: ProcessCoolingAssessment): ProcessCoolingChillerOutput[] {
    const chillerInputVector = this._createChillerInputVector(assessment.inventory);
    const waterCooledSystemInputInstance = this._createWaterCooledSystemInput(assessment.systemInformation.waterCooledSystemInput, assessment.systemInformation.operations);
    const towerInputInstance = this._createTowerInput(assessment.systemInformation.towerInput);
    const processCoolingInstance = this._createProcessCoolingWaterCooledInput(
      assessment,
      chillerInputVector,
      towerInputInstance,
      waterCooledSystemInputInstance
    );

    const chillerOutput = processCoolingInstance.calculateChillerEnergy();
    const result: ProcessCoolingChillerOutput[] = [];
    const numChillers = chillerOutput.efficiency.size();
    for (let i = 0; i < numChillers; i++) {
      result.push({
        efficiency: this._extractArray(chillerOutput.efficiency.get(i)),
        hours: this._extractArray(chillerOutput.hours.get(i)),
        power: this._extractArray(chillerOutput.power.get(i)),
        energy: this._extractArray(chillerOutput.energy.get(i))
      });
    }
    chillerOutput.delete();
    processCoolingInstance.delete();
    chillerInputVector.delete();
    waterCooledSystemInputInstance.delete();
    towerInputInstance.delete();
    return result;
  }

  /**
   * Calculates pump energy for the process cooling system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   *   - pumpInput: {flowRate: number (gpm), efficiency: number (fraction or % assumed), numPumps: number, motorEfficiency: number (fraction or % assumed)}
   *   - chillerInput: {capacity: number (tons), ...}
   *   - processCoolingInput: {systemOperationAnnualHours: IntVector (hours), ...}
   *   - airCooledSystemInput or waterCooledSystemInput as appropriate
   * @returns {ProcessCoolingPumpOutput} Object with:
   *   - chillerPumpingEnergy: number[] (kWh)
   */
  runPumpEnergy(assessment: ProcessCoolingAssessment): ProcessCoolingPumpOutput {
    const chillerInputVector = this._createChillerInputVector(assessment.inventory);
    let processCoolingInstance: any;
    if (assessment.systemBasics.condenserCoolingMethod === 'air') {
      const airCooledSystemInputInstance = this._createAirCooledSystemInput(assessment.systemInformation.airCooledSystemInput, assessment.systemInformation.operations);
      processCoolingInstance = this._createProcessCoolingAirCooledInput(
        assessment,
        chillerInputVector,
        airCooledSystemInputInstance
      );
      airCooledSystemInputInstance.delete();
    } else {
      const waterCooledSystemInputInstance = this._createWaterCooledSystemInput(assessment.systemInformation.waterCooledSystemInput, assessment.systemInformation.operations);
      const towerInputInstance = this._createTowerInput(assessment.systemInformation.towerInput);
      processCoolingInstance = this._createProcessCoolingWaterCooledInput(
        assessment,
        chillerInputVector,
        towerInputInstance,
        waterCooledSystemInputInstance
      );
      waterCooledSystemInputInstance.delete();
      towerInputInstance.delete();
    }
    const pumpInputInstance = this._createPumpInput(assessment.systemInformation.pumpInput);
    const pumpOutput = processCoolingInstance.calculatePumpEnergy(pumpInputInstance);
    const result: ProcessCoolingPumpOutput = {
      chillerPumpingEnergy: this._extractArray(pumpOutput.chillerPumpingEnergy)
    };
    pumpOutput.delete();
    processCoolingInstance.delete();
    chillerInputVector.delete();
    pumpInputInstance.delete();
    return result;
  }

  /**
   * Calculates tower energy for a water-cooled system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   *   - towerInput: {numTowers: number, numCells: number, fanMotorSpeedType: number, ...}
   *   - processCoolingInput: {systemOperationAnnualHours: IntVector (hours), wetBulbHourlyTemp: DoubleVector (°F), ...}
   * @returns {ProcessCoolingTowerOutput} Object with:
   *   - hours: number[] (hours in each wet bulb temp bin)
   *   - energy: number[] (kWh in each wet bulb temp bin)
   */
  runTowerEnergy(assessment: ProcessCoolingAssessment): ProcessCoolingTowerOutput {
    const chillerInputVector = this._createChillerInputVector(assessment.inventory);
    const waterCooledSystemInputInstance = this._createWaterCooledSystemInput(assessment.systemInformation.waterCooledSystemInput, assessment.systemInformation.operations);
    const towerInputInstance = this._createTowerInput(assessment.systemInformation.towerInput);
    const processCoolingInstance = this._createProcessCoolingWaterCooledInput(
      assessment,
      chillerInputVector,
      towerInputInstance,
      waterCooledSystemInputInstance
    );
    const towerOutput = processCoolingInstance.calculateTowerEnergy();
    const result: ProcessCoolingTowerOutput = {
      hours: this._extractArray(towerOutput.hours),
      energy: this._extractArray(towerOutput.energy)
    };
    towerOutput.delete();
    processCoolingInstance.delete();
    chillerInputVector.delete();
    waterCooledSystemInputInstance.delete();
    towerInputInstance.delete();
    return result;
  }

  private _createAirCooledSystemInput(input: AirCooledSystemInput, operations: Operations): any {
    const ACSource = this.suiteApiHelperService.getProcessCoolingCoolingAirSourceEnum(input.ACSource);
    return new Module.AirCooledSystemInput(
      operations.chilledWaterSupplyTemp,
      input.OADT,
      ACSource,
      input.indoorTemp,
      input.CWTFollow
    );
  }

  private _createWaterCooledSystemInput(input: WaterCooledSystemInput, operations: Operations): any {
    return new Module.WaterCooledSystemInput(
      operations.chilledWaterSupplyTemp,
      input.useFreeCooling,
      input.HEXApproachTemp,
      input.constantCWT,
      input.CWT,
      input.CWVariableFlow,
      input.CWFlowRate,
      input.CWTFollow,
    );
  }

  // todo 7639, will need additional create methods  for changing refrigerants, etc.
  private _createChillerInputVector(chillerInventoryItems: ChillerInventoryItem[]): any {
    const chillers = new Module.ChillerInputV();

    for (const input of chillerInventoryItems as ChillerInventoryItem[]) {
      const chillerMonthlyLoad2D = this.suiteApiHelperService.returnDoubleVector2d(input.monthlyLoads);
      const chiller = new Module.ChillerInput(
        this.suiteApiHelperService.getProcessCoolingChillerCompressorTypeEnum(input.chillerType),
        input.capacity,
        input.isFullLoadEffKnown,
        input.fullLoadEff,
        input.age,
        input.installVSD,
        input.useARIMonthlyLoadSchedule,
        chillerMonthlyLoad2D,
      );

      chillers.push_back(chiller);
      chiller.delete();
      chillerMonthlyLoad2D.delete();
    }
    return chillers;
  }

  private _createPumpInput(input: PumpInput): any {
    return new Module.PumpInput(
      input.variableFlow,
      input.flowRate,
      input.efficiency,
      input.motorSize,
      input.motorEfficiency
    );
  }

  private _createTowerInput(input: TowerInput): any {
    const fanSpeedTypeEnum =  this.suiteApiHelperService.getProcessCoolingFanMotorSpeedTypeEnum(input.fanSpeedType)
    const towerSizingEnum = this.suiteApiHelperService.getProcessCoolingTowerSizedByEnum(input.towerSizing)
    const towerCellFanTypeEnum = this.suiteApiHelperService.getProcessCoolingFanTypeEnum(input.towerCellFanType)

    return new Module.TowerInput(
      input.numTowers,
      input.numFanPerTowerCells,
      fanSpeedTypeEnum,
      towerSizingEnum,
      towerCellFanTypeEnum,
      input.cellFanHP,
      input.tonnage
    );
  }

  private _createProcessCoolingAirCooledInput(assessment: ProcessCoolingAssessment, chillerInputVector, airCooledSystemInput): any {
      // todo 7639 will need to retrieve weather
    const onHoursArray = Array(8760).fill(1);
    const dryBulbHourlyTemp = Array(8760).fill(43);
    const wetBulbHourlyTemp = Array(8760).fill(35);

    const onHoursVector = this.suiteApiHelperService.returnIntVector(onHoursArray);
    const dryBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(dryBulbHourlyTemp);
    const wetBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(wetBulbHourlyTemp);

    return new Module.ProcessCooling(
      onHoursVector,
      dryBulbHourlyTempVector,
      wetBulbHourlyTempVector,
      chillerInputVector,
      airCooledSystemInput,
    );
  }

  private _createProcessCoolingWaterCooledInput(assessment: ProcessCoolingAssessment, chillerInputVector,
    towerInputInstance,
    waterCooledSystemInputInstance): any {
      // todo 7639 will need to retrieve weather
    const onHoursArray = Array(8760).fill(1);
    const dryBulbHourlyTemp = Array(8760).fill(43);
    const wetBulbHourlyTemp = Array(8760).fill(35);

    let onHoursVector = new Module.IntVector();
    let dryBulbHourlyTempVector = new Module.DoubleVector();
    let wetBulbHourlyTempVector = new Module.DoubleVector();

    onHoursVector = this.suiteApiHelperService.returnIntVector(onHoursArray);
    dryBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(dryBulbHourlyTemp);
    wetBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(wetBulbHourlyTemp);

    return new Module.ProcessCooling(
      onHoursVector,
      dryBulbHourlyTempVector,
      wetBulbHourlyTempVector,
      chillerInputVector,
      towerInputInstance,
      waterCooledSystemInputInstance
    );

  }

  // todo 7639 may use suite api helper service
  // --- Helper to extract JS array from WASM vector ---
  private _extractArray(wasmVec: any): number[] {
    if (!wasmVec || typeof wasmVec.size !== 'function' || typeof wasmVec.get !== 'function') return [];
    const arr = [];
    for (let i = 0; i < wasmVec.size(); i++) {
      arr.push(wasmVec.get(i));
    }
    wasmVec.delete && wasmVec.delete();
    return arr;
  }
}