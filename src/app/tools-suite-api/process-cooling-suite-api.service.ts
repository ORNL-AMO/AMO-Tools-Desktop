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
  ChillerInventoryItem,
  ProcessCoolingResults
} from '../shared/models/process-cooling-assessment';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { HttpClient } from '@angular/common/http';
// import { drybulbValues, wetbulbValues, systemOnHoursYearly } from '../examples/CWSATExampleAirCooledConstant';
import { drybulbValues, wetbulbValues, systemOnHoursYearly } from '../examples/CWSATExampleVINPLTConstants';

declare var Module: any;

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService, private httpClient: HttpClient) { }

  /**
 * Calculates chiller energy for a water-cooled system.
 * @param assessment {ProcessCoolingAssessment} - Assessment input object.
 * @returns ProcessCoolingResults - Object with:
 *   - chiller: ProcessCoolingChillerOutput[] - Array of chiller outputs
 *   - pump: ProcessCoolingPumpOutput - Pump energy outputs
 *   - tower: ProcessCoolingTowerOutput - Tower energy outputs
 */
  getWaterCooledResults(assessment: ProcessCoolingAssessment): ProcessCoolingResults {
    let results: ProcessCoolingResults = {
      chiller: undefined as ProcessCoolingChillerOutput[],
      pump: undefined as ProcessCoolingPumpOutput,
      tower: undefined as ProcessCoolingTowerOutput
    };

    const chillerInputVector = this._createChillerInputVector(assessment.inventory);
    const waterCooledSystemInputInstance = this._createWaterCooledSystemInput(assessment.systemInformation.waterCooledSystemInput, assessment.systemInformation.operations, assessment.systemInformation.pumpInput);
    const towerInputInstance = this._createTowerInput(assessment.systemInformation.towerInput);
    const processCoolingInstance = this._createProcessCoolingInput(chillerInputVector, waterCooledSystemInputInstance, towerInputInstance);

    results.chiller = this._getChillerOutput(processCoolingInstance);
    results.tower = this.getTowerEnergy(processCoolingInstance);
    results.pump = this.getWaterCooledPumpEnergy(assessment, processCoolingInstance);

    processCoolingInstance.delete();
    chillerInputVector.delete();
    waterCooledSystemInputInstance.delete();
    towerInputInstance.delete();
    return results;
  }


  /**
   * Calculates chiller energy for an air-cooled system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   * @returns ProcessCoolingResults - Object with:
   *  - chiller: ProcessCoolingChillerOutput[] - Array of chiller outputs
   *  - pump: ProcessCoolingPumpOutput - Pump energy outputs
   */
  getAirCooledResults(assessment: ProcessCoolingAssessment): ProcessCoolingResults {
    let results: ProcessCoolingResults = {
      chiller: undefined as ProcessCoolingChillerOutput[],
      pump: undefined as ProcessCoolingPumpOutput,
    };

    const chillerInputVector = this._createChillerInputVector(assessment.inventory);
    const airCooledSystemInputInstance = this._createAirCooledSystemInput(assessment.systemInformation.airCooledSystemInput, assessment.systemInformation.operations);
    const processCoolingInstance = this._createProcessCoolingInput(chillerInputVector, airCooledSystemInputInstance);

    results.chiller = this._getChillerOutput(processCoolingInstance);
    results.pump = this.getAirCooledPumpEnergy(assessment, processCoolingInstance);

    processCoolingInstance.delete();
    chillerInputVector.delete();
    airCooledSystemInputInstance.delete();
    return results;
  }

  /**
   * Calculates pump energy for water cooled process cooling system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   * @param processCoolingInstance {any} - Instance of the ProcessCooling module.
   * @returns {ProcessCoolingPumpOutput} Object with:
   *   - chillerPumpingEnergy: number[] (kWh)
   *   - condenserPumpingEnergy: number[] (kWh)
   */
  getWaterCooledPumpEnergy(assessment: ProcessCoolingAssessment, processCoolingInstance: any): ProcessCoolingPumpOutput {
    const pumpInputCWInstance = this._createPumpCWInput(assessment.systemInformation.pumpInput);
    const pumpCWOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCWInstance);
    const pumpInputCHWInstance = this._createPumpCHWInput(assessment.systemInformation.pumpInput);
    const pumpCWHOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCHWInstance);

    const result: ProcessCoolingPumpOutput = {
      chillerPumpingEnergy: this._extractArray(pumpCWHOutput.chillerPumpingEnergy),
      condenserPumpingEnergy: this._extractArray(pumpCWOutput.chillerPumpingEnergy)
    };

    pumpCWHOutput.delete();
    pumpCWOutput.delete();
    pumpInputCHWInstance.delete();
    return result;
  }


  /**
   * Calculates pump energy for air cooled process cooling system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   * @param processCoolingInstance {any} - Instance of the ProcessCooling module.
   * @returns {ProcessCoolingPumpOutput} Object with:
   *   - chillerPumpingEnergy: number[] (kWh)
   */
  getAirCooledPumpEnergy(assessment: ProcessCoolingAssessment, processCoolingInstance: any): ProcessCoolingPumpOutput {
    assessment.systemInformation.pumpInput.variableFlowCW = false; // used in water-cooled systems only
    assessment.systemInformation.pumpInput.flowRateCW = 0; // used in water-cooled systems only
    const pumpInputCHWInstance = this._createPumpCHWInput(assessment.systemInformation.pumpInput);
    const pumpCWHOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCHWInstance);
    const result: ProcessCoolingPumpOutput = {
      chillerPumpingEnergy: this._extractArray(pumpCWHOutput.chillerPumpingEnergy),
    };

    pumpCWHOutput.delete();
    pumpInputCHWInstance.delete();
    return result;
  }

  /**
   * Calculates tower energy for a water-cooled system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   * @returns {ProcessCoolingTowerOutput} Object with:
   *   - hours: number[] (hours in each wet bulb temp bin)
   *   - energy: number[] (kWh in each wet bulb temp bin)
   */
  getTowerEnergy(processCoolingInstance: any): ProcessCoolingTowerOutput {
    const towerOutput = processCoolingInstance.calculateTowerEnergy();
    const result: ProcessCoolingTowerOutput = {
      hours: this._extractArray(towerOutput.hours),
      energy: this._extractArray(towerOutput.energy)
    };
    console.log('towerOutput hours total', result.hours.reduce((a, b) => a + b, 0));
    towerOutput.delete();
    return result;
  }

  // todo 7655, will need additional create methods  for changing refrigerants, etc.
  /**
   * Creates a Module.ChillerInputV vector and populates it with Module.ChillerInput instances.
   * @param chillerInventoryItems {ChillerInventoryItem[]} - Array of chiller inventory items.
   * @returns {any} Module.ChillerInputV instance
   */
  private _createChillerInputVector(chillerInventoryItems: ChillerInventoryItem[]): any {
    const chillers = new Module.ChillerInputV();

    for (const input of chillerInventoryItems as ChillerInventoryItem[]) {
      console.log('ChillerInventoryItem input:', input);
      console.log('  chillerType:', input.chillerType);
      console.log('  capacity:', input.capacity);
      console.log('  isFullLoadEffKnown:', input.isFullLoadEffKnown);
      console.log('  fullLoadEff:', input.fullLoadEff);
      console.log('  age:', input.age);
      console.log('  installVSD:', input.installVSD);
      console.log('  useARIMonthlyLoadSchedule:', input.useARIMonthlyLoadSchedule);
      console.log('  monthlyLoads:', input.monthlyLoads);
      const chillerMonthlyLoad2D = this.suiteApiHelperService.returnDoubleVector2d(input.monthlyLoads);

      const chiller = this._createChillerInput(
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

  /**
   * Creates a `ProcessCooling` instance from inputs and location based weather data
   *
   * @param chillerInputVector {any} - Vector of chiller inputs (Module.ChillerInputV)
   * @param coolingMethodSystemInputInstance {any} - Air or water cooled system input (Module.AirCooledSystemInput or Module.WaterCooledSystemInput)
   * @param towerInputInstance {any} - (Optional) Tower input (Module.TowerInput)
   * @returns A new `ProcessCooling` instance 
   */
  private _createProcessCoolingInput(chillerInputVector: any, coolingMethodSystemInputInstance: any, towerInputInstance?: any): any {

    let onHoursVector = new Module.IntVector();
    let dryBulbHourlyTempVector = new Module.DoubleVector();
    let wetBulbHourlyTempVector = new Module.DoubleVector();
    onHoursVector = this.suiteApiHelperService.returnIntVector(systemOnHoursYearly);
    dryBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(drybulbValues);
    wetBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(wetbulbValues);

    if (!towerInputInstance) {
      return this.createProcessCoolingAirCooled(
        onHoursVector,
        dryBulbHourlyTempVector,
        wetBulbHourlyTempVector,
        chillerInputVector,
        coolingMethodSystemInputInstance
      );
    } else {
      return this.createProcessCoolingWaterCooled(
        onHoursVector,
        dryBulbHourlyTempVector,
        wetBulbHourlyTempVector,
        chillerInputVector,
        towerInputInstance,
        coolingMethodSystemInputInstance
      );
    }

  }

    /**
   * Creates a Module.WaterCooledSystemInput instance.
   * @param input {WaterCooledSystemInput} - Water cooled system input object.
   * @param operations {Operations} - Operations object, provides chilledWaterSupplyTemp
   * @param pumpInput {PumpInput} - Pump input object for condenser water
   *   @property CHWT {number} Chilled Water Supply Temperature (°F), 35-55, default 44
   *   @property useFreeCooling {boolean} Use free cooling
   *   @property HEXApproachTemp {number} Heat exchanger approach temp (°F), 5-20, default 0
   *   @property constantCWT {boolean} Is condenser water temperature constant
   *   @property CWT {number} Condenser water temperature (°F), 70-90, default 85
   *   @property CWVariableFlow {boolean} Is condenser water flow variable, default true
   *   @property CWFlowRate {number} Condenser water flow rate (gpm/ton), default 3
   *   @property CWTFollow {number} If condenser water temp not constant, 5-20, default 0
   * @returns {any} Module.WaterCooledSystemInput instance
   */
  private _createWaterCooledSystemInput(input: WaterCooledSystemInput, operations: Operations, pumpInput: PumpInput): any {
    return new Module.WaterCooledSystemInput(
      operations.chilledWaterSupplyTemp,
      input.useFreeCooling,
      input.HEXApproachTemp,
      input.constantCWT,
      input.CWT,
      // todo 7655 2 pumpInputs need defaults?
      pumpInput.variableFlowCW,
      pumpInput.flowRateCW,
      input.CWTFollow,
    );
  }

    /**
   * Creates a Module.AirCooledSystemInput instance.
   * @param input {AirCooledSystemInput} - Air cooled system input object.
   * @param operations {Operations} - Operations object, provides chilledWaterSupplyTemp
   *   @property CHWT {number} Chilled Water Supply Temperature (°F), 35-55, default 44
   *   @property OADT {number} Outdoor Air Design Temperature (°F), 80-110, default 95
   *   @property ACSource {number} Cooling Air Source (enum: 0=Inside, 1=Outside)
   *   @property indoorTemp {number} Average Indoor Temp (°F), if Air Source is Indoor, 60-90, default 75
   *   @property CWTFollow {number} If Air Source is Outside, 5-20, default 0
   * @returns {any} Module.AirCooledSystemInput instance
   */
  private _createAirCooledSystemInput(input: AirCooledSystemInput, operations: Operations): any {
    const ACSource = this.suiteApiHelperService.getProcessCoolingCoolingAirSourceEnum(input.ACSource);
    console.log('AirCooledSystemInput Inputs:');
    console.log('chilledWaterSupplyTemp:', operations.chilledWaterSupplyTemp);
    console.log('OADT (Outdoor Air Design Temp):', input.OADT);
    console.log('ACSource (Cooling Air Source):', ACSource);
    console.log('indoorTemp (Average Indoor Temp):', input.indoorTemp);
    console.log('CWTFollow:', input.CWTFollow);

    return new Module.AirCooledSystemInput(
      operations.chilledWaterSupplyTemp,
      input.OADT,
      ACSource,
      input.indoorTemp,
      input.CWTFollow
    );
  }

  /**
 * Extracts chiller output data from a ProcessCooling instance.
 * @param processCoolingInstance - The instance of the ProcessCooling WASM module.
 * @returns An array of `ProcessCoolingChillerOutput` objects, each containing:
 *   - efficiency: number[] (kW/ton for each bin)
 *   - hours: number[] (operating hours for each bin)
 *   - power: number[] (power usage for each bin, kW)
 *   - energy: number[] (energy usage for each bin, kWh)
 */
  private _getChillerOutput(processCoolingInstance): ProcessCoolingChillerOutput[] {
    const chillerOutputInstance = processCoolingInstance.calculateChillerEnergy();
    const chillerOutput: ProcessCoolingChillerOutput[] = [];
    const numChillers = chillerOutputInstance.efficiency.size();
    for (let i = 0; i < numChillers; i++) {
      chillerOutput.push({
        efficiency: this._extractArray(chillerOutputInstance.efficiency.get(i)),
        hours: this._extractArray(chillerOutputInstance.hours.get(i)),
        power: this._extractArray(chillerOutputInstance.power.get(i)),
        energy: this._extractArray(chillerOutputInstance.energy.get(i))
      });
    }

    chillerOutputInstance.delete();
    return chillerOutput;
  }

  /**
   * Extracts a number array from a WASM vector.
   * @param vector - The WASM vector to extract from.
   * @returns A number array containing the values from the vector.
   */
  private createProcessCoolingWaterCooled(onHoursVector,
    dryBulbHourlyTempVector,
    wetBulbHourlyTempVector,
    chillerInputVector,
    towerInputInstance,
    coolingMethodSystemInputInstance) {
    return new Module.ProcessCooling(
      onHoursVector,
      dryBulbHourlyTempVector,
      wetBulbHourlyTempVector,
      chillerInputVector,
      towerInputInstance,
      coolingMethodSystemInputInstance
    );
  }

  /**
 * Extracts a number array from a WASM vector.
 * @param vector - The WASM vector to extract from.
 * @returns A number array containing the values from the vector.
 */
  private createProcessCoolingAirCooled(onHoursVector,
    dryBulbHourlyTempVector,
    wetBulbHourlyTempVector,
    chillerInputVector,
    coolingMethodSystemInputInstance) {
    return new Module.ProcessCooling(
      onHoursVector,
      dryBulbHourlyTempVector,
      wetBulbHourlyTempVector,
      chillerInputVector,
      coolingMethodSystemInputInstance,
    );
  }



  /**
  *
  * @details Use this constructor when not defining custom Chiller and not replacing chiller refrigerant
  *
  * @author Suite constructor param names
  * @property chillerType Enumeration ChillerCompressorType
  * @property capacity double, units ton
  * @property isFullLoadEffKnown boolean, Is full load efficiency known? for this Chiller
  * @property fullLoadEff double, fraction, 0.2 - 2.5 increments of .01
  * @property age double # of years, 0 - 20, (can be 1.5 for eighteen months), assumption chiller efficiency is degraded by 1% / year
  * @property installVSD boolean, Install a VSD on each Centrifugal Compressor Motor
  * @property useARIMonthlyLoadSchedule boolean, if true monthlyLoads not needed and can be set to empty
  * @property monthlyLoads double, 12x11 array of 11 %load bins (0,10,20,30,40,50,60,70,80,90,100) for 12 calendar months
  */
  private _createChillerInput(chillerInputType,
        capacity,
        isFullLoadEffKnown,
        fullLoadEff,
        age,
        installVSD,
        useARIMonthlyLoadSchedule,
        chillerMonthlyLoad2D): any {
    return new Module.ChillerInput(
      chillerInputType,
      capacity,
      isFullLoadEffKnown,
      fullLoadEff,
      age,
      installVSD,
      useARIMonthlyLoadSchedule,
      chillerMonthlyLoad2D
    );
  }

  /**
   * Creates a Module.PumpInput instance for chilled water.
   * 
   * @param input {PumpInput} - Pump input object.
   * 
   * @author Suite constructor param names
   * @property variableFlow {boolean} Variable flow for chilled water
   * @property flowRate {number} Flow rate for chilled water (gpm/ton)
   * @property efficiency {number} Pump efficiency (fraction)
   * @property motorSize {number} Pump motor size (hp)
   * @property motorEfficiency {number} Pump motor efficiency (fraction)
   * @returns {any} Module.PumpInput instance
   */
  private _createPumpCHWInput(input: PumpInput): any {
    return new Module.PumpInput(
      input.variableFlow,
      input.flowRate,
      input.efficiency,
      input.motorSize,
      input.motorEfficiency
    );
  }

  /**
   * Creates a Module.PumpInput instance for condenser water.
   * @param input {PumpInput} - Pump input object.
   * 
   * @author Suite constructor param names
   * @property variableFlowCW {boolean} Variable flow for condenser water
   * @property flowRateCW {number} Flow rate for condenser water (gpm/ton)
   * @property efficiencyCW {number} Pump efficiency for condenser water (fraction)
   * @property motorSizeCW {number} Pump motor size for condenser water (hp)
   * @property motorEfficiencyCW {number} Pump motor efficiency for condenser water (fraction)
   * @returns {any} Module.PumpInput instance
   */
  private _createPumpCWInput(input: PumpInput): any {
    return new Module.PumpInput(
      input.variableFlowCW,
      input.flowRateCW,
      input.efficiencyCW,
      input.motorSizeCW,
      input.motorEfficiencyCW
    );
  }

  /**
   * Creates a Module.TowerInput instance.
   * @param input {TowerInput} - Tower input object.
   * 
   * @author Suite constructor param names
   * @property numTowers {number} Number of towers
   * @property numFanPerTowerCells {number} Number of cells per tower
   * @property fanSpeedType {number} Fan motor speed type (enum: 0=One, 1=Two, 2=Variable)
   * @property towerSizing {number} Tower sized by (enum: 0=Tonnage, 1=Fan_HP)
   * @property towerCellFanType {number} Cell fan type (enum: 0=AxialFan, 1=CentrifugalFan)
   * @property cellFanHP {number} Cell fan horsepower (hp)
   * @property tonnage {number} Tower tonnage (tons)
   * @returns {any} Module.TowerInput instance
   */
  private _createTowerInput(input: TowerInput): any {
    const fanSpeedTypeEnum = this.suiteApiHelperService.getProcessCoolingFanMotorSpeedTypeEnum(input.fanSpeedType)
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