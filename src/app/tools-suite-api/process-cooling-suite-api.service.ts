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
import { WeatherContextData } from '../shared/modules/weather-data/weather-context.token';

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
  getWaterCooledResults(assessment: ProcessCoolingAssessment, weatherData: WeatherContextData): ProcessCoolingResults {
    let results: ProcessCoolingResults = {
      chiller: undefined as ProcessCoolingChillerOutput[],
      pump: undefined as ProcessCoolingPumpOutput,
      tower: undefined as ProcessCoolingTowerOutput
    };

    const chillerInputVector = this._createChillerInputVector(assessment.inventory, assessment.systemInformation.operations.doChillerLoadSchedulesVary);
    const towerInputInstance = this._createTowerInput(assessment.systemInformation.towerInput);
    const waterCooledSystemInputInstance = this._createWaterCooledSystemInput(assessment.systemInformation.waterCooledSystemInput, assessment.systemInformation.operations, assessment.systemInformation.condenserWaterPumpInput, assessment.systemInformation.towerInput);
    const processCoolingInstance = this._createProcessCoolingInput(chillerInputVector, waterCooledSystemInputInstance, weatherData, towerInputInstance);

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
  getAirCooledResults(assessment: ProcessCoolingAssessment, weatherData: WeatherContextData): ProcessCoolingResults {
    let results: ProcessCoolingResults = {
      chiller: undefined as ProcessCoolingChillerOutput[],
      pump: undefined as ProcessCoolingPumpOutput,
    };

    const chillerInputVector = this._createChillerInputVector(assessment.inventory, assessment.systemInformation.operations.doChillerLoadSchedulesVary);
    const airCooledSystemInputInstance = this._createAirCooledSystemInput(assessment.systemInformation.airCooledSystemInput, assessment.systemInformation.operations);
    const processCoolingInstance = this._createProcessCoolingInput(chillerInputVector, airCooledSystemInputInstance, weatherData);

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
    const pumpInputCWInstance = this._createPumpInput(assessment.systemInformation.condenserWaterPumpInput);
    const pumpCWOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCWInstance);
    const pumpInputCHWInstance = this._createPumpInput(assessment.systemInformation.chilledWaterPumpInput);
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
    // assessment.systemInformation.condenserWaterPumpInput.variableFlow = false; // used in water-cooled systems only
    // assessment.systemInformation.condenserWaterPumpInput.flowRate = 0; // used in water-cooled systems only
    const pumpInputCHWInstance = this._createPumpInput(assessment.systemInformation.chilledWaterPumpInput);
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
  private _createChillerInputVector(chillerInventoryItems: ChillerInventoryItem[], doChillerLoadSchedulesVary: boolean): any {
    const chillers = new Module.ChillerInputV();

    for (const input of chillerInventoryItems as ChillerInventoryItem[]) {
      // console.log('ChillerInventoryItem input:', input);
      // console.log('  chillerType:', input.chillerType);
      // console.log('  capacity:', input.capacity);
      // console.log('  isFullLoadEfficiencyKnown:', input.isFullLoadEfficiencyKnown);
      // console.log('  fullLoadEfficiency:', input.fullLoadEfficiency);
      // console.log('  age:', input.age);
      // console.log('  installVSD:', input.installVSD);
      // console.log('  useARIloadScheduleByMonthchedule:', input.useARIloadScheduleByMonthchedule);
      // console.log('  loadScheduleByMonth:', input.loadScheduleByMonth);

      const loadSchedule = input.useSameMonthlyLoading ? [input.loadScheduleAllMonths] : input.loadScheduleByMonth;
      const chillerMonthlyLoading = this.suiteApiHelperService.returnDoubleVector2d(loadSchedule);

      const chiller = this._createChillerInput(
        this.suiteApiHelperService.getProcessCoolingChillerCompressorTypeEnum(input.chillerType),
        input.capacity,
        input.isFullLoadEfficiencyKnown,
        input.fullLoadEfficiency,
        input.age,
        input.installVSD,
        input.useARIloadScheduleByMonthchedule,
        chillerMonthlyLoading,
      );

      chillers.push_back(chiller);
      chiller.delete();
      chillerMonthlyLoading.delete();
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
  private _createProcessCoolingInput(chillerInputVector: any, coolingMethodSystemInputInstance: any, weatherData: WeatherContextData, towerInputInstance?: any): any {
    const dryBulbHourly: (number)[] = [];
    const wetBulbHourly: (number)[] = [];

    // * keep below for debugging future implementation with interpolation of missign data
    let wetbulbUndefined = 0;
    let dryBulbUndefined = 0;
    
    for (const hour of weatherData.weatherDataPoints) {
      if (hour.wet_bulb_temp == undefined) {
        console.log('hour undefined', hour);
        wetbulbUndefined++;
        hour.wet_bulb_temp = 0;
      } else if (hour.dry_bulb_temp == undefined) {
        console.log('hour undefined', hour);
        dryBulbUndefined++;
        hour.dry_bulb_temp = 0;
      }
      dryBulbHourly.push(hour.dry_bulb_temp);
      wetBulbHourly.push(hour.wet_bulb_temp);
    }

    console.log('wetbulbUndefined', wetbulbUndefined);
    console.log('dryBulbUndefined', dryBulbUndefined);

    let onHoursVector = new Module.IntVector();
    let dryBulbHourlyTempVector = new Module.DoubleVector();
    let wetBulbHourlyTempVector = new Module.DoubleVector();
    onHoursVector = this.suiteApiHelperService.returnIntVector(systemOnHoursYearly);
    
    dryBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(dryBulbHourly);
    wetBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(wetBulbHourly);

    console.log(dryBulbHourly);
    console.log(wetBulbHourly);

    // console.log(dryBulbHourlyTempVector.size());
    // let debug = this._extractArray(dryBulbHourlyTempVector);
    // console.log(debug);

    // dryBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(drybulbValues);
    // wetBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(wetbulbValues);

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
   * @param towerInput {TowerInput} - Tower input object
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
  private _createWaterCooledSystemInput(input: WaterCooledSystemInput, operations: Operations, condenserPumpInput: PumpInput, towerInput: TowerInput): any {
    return new Module.WaterCooledSystemInput(
      operations.chilledWaterSupplyTemp,
      towerInput.usesFreeCooling,
      towerInput.HEXApproachTemp,
      input.isConstantCondenserWaterTemp,
      input.condenserWaterTemp,
      // todo 7655 2 pumpInputs need defaults?
      condenserPumpInput.variableFlow,
      condenserPumpInput.flowRate,
      input.followingTempDifferential,
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
    const ACSource = this.suiteApiHelperService.getProcessCoolingCoolingAirSourceEnum(input.airCoolingSource);
    console.log('AirCooledSystemInput Inputs:');
    console.log('chilledWaterSupplyTemp:', operations.chilledWaterSupplyTemp);
    console.log('outdoorAirTemp (Outdoor Air Design Temp):', input.outdoorAirTemp);
    console.log('ACSource (Cooling Air Source):', ACSource);
    console.log('indoorTemp (Average Indoor Temp):', input.indoorTemp);
    console.log('followingTempDifferential:', input.followingTempDifferential);

    return new Module.AirCooledSystemInput(
      operations.chilledWaterSupplyTemp,
      input.outdoorAirTemp,
      ACSource,
      input.indoorTemp,
      input.followingTempDifferential
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
  * @property useARIloadScheduleByMonthchedule boolean, if true loadScheduleByMonth not needed and can be set to empty
  * @property loadScheduleByMonth double, 12x11 array of 11 %load bins (0,10,20,30,40,50,60,70,80,90,100) for 12 calendar months
  */
  private _createChillerInput(chillerInputType,
        capacity,
        isFullLoadEffKnown,
        fullLoadEff,
        age,
        installVSD,
        useARIloadScheduleByMonthchedule,
        chillerMonthlyLoad2D): any {
    return new Module.ChillerInput(
      chillerInputType,
      capacity,
      isFullLoadEffKnown,
      fullLoadEff,
      age,
      installVSD,
      useARIloadScheduleByMonthchedule,
      chillerMonthlyLoad2D
    );
  }

  /**
   * Creates a Module.PumpInput instance for chilled water or condenser water.
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
  private _createPumpInput(input: PumpInput): any {
    const efficiencyFraction = input.efficiency / 100;
    const motorEfficiencyFraction = input.motorEfficiency / 100;
    return new Module.PumpInput(
      input.variableFlow,
      input.flowRate,
      efficiencyFraction,
      input.motorSize,
      motorEfficiencyFraction
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
    const towerSizingEnum = this.suiteApiHelperService.getProcessCoolingTowerSizedByEnum(input.towerSizeMetric)
    const towerCellFanTypeEnum = this.suiteApiHelperService.getProcessCoolingFanTypeEnum(input.fanType)

    return new Module.TowerInput(
      input.numberOfTowers,
      input.numberOfFans,
      fanSpeedTypeEnum,
      towerSizingEnum,
      towerCellFanTypeEnum,
      input.towerSize,
      input.towerSize
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