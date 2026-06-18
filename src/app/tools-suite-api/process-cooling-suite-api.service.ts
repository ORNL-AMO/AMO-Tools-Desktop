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
  ProcessCoolingResults,
  PumpChillerItemEnergy
} from '../shared/models/process-cooling-assessment';
import { SuiteApiHelperService } from './suite-api-helper.service';
// import { drybulbValues, wetbulbValues, systemOnHoursYearly } from '../examples/CWSATExampleAirCooledConstant';
// import { drybulbValues, wetbulbValues, systemOnHoursYearly } from '../examples/CWSATExampleVINPLTConstants';
import { WeatherContextData } from '../shared/modules/weather-data/weather-context.token';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type ACSourceLocation,
  type AirCooledSystemInput as SuiteAirCooledSystemInput,
  type CellFanType,
  type ChillerCompressorType,
  type ChillerInput as SuiteChillerInput,
  type ChillerInputV,
  type ChillerOutput,
  type ChillerPumpingEnergyOutput,
  type DoubleVector,
  type DoubleVector2D,
  type FanMotorSpeedType,
  type IntVector,
  type ProcessCooling,
  type PumpInput as SuitePumpInput,
  type RefrigerantType,
  type TowerInput as SuiteTowerInput,
  type TowerOutput,
  type TowerSizedBy,
  type WaterCooledSystemInput as SuiteWaterCooledSystemInput,
} from 'measur-tools-suite';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService, 
    private toolsSuiteApiService: ToolsSuiteApiService) { }
  
    // todo update suite to take chiller ids
    // * map chiller input index to chiller name for labeling results, assuming no ordering changes on the suite API side. 
    chillerInputResultMap:  {
      [inputIndex: number]: {id: string, name: string};
    }

    
  /**
 * Calculates chiller energy for a water-cooled system.
 * @param assessment {ProcessCoolingAssessment} - Assessment input object.
 * @param weatherData {WeatherContextData} - Weather data for the location of the system.
 * @param suiteModificationArgs {SuiteModificationArgs} - (Optional) Arguments to determine if and how to modify inputs for modification scenarios, such as changing refrigerant type
 * @returns ProcessCoolingResults - Object with:
 *   - chiller: ProcessCoolingChillerOutput[] - Array of chiller outputs
 *   - pump: ProcessCoolingPumpOutput - Pump energy outputs
 *   - tower: ProcessCoolingTowerOutput - Tower energy outputs
 */
  getWaterCooledResults(assessment: ProcessCoolingAssessment, weatherData: WeatherContextData, suiteModificationArgs?: SuiteModificationArgs): ProcessCoolingResults {
    let results: ProcessCoolingResults = {
      id: undefined,
      name: assessment.name,
      fuelCost: assessment.systemInformation.operations.fuelCost,
      electricityCost: assessment.systemInformation.operations.electricityCost,
      chiller: undefined as ProcessCoolingChillerOutput[],
      pump: undefined as ProcessCoolingPumpOutput,
      tower: undefined as ProcessCoolingTowerOutput
    };

    this.setChillerDataResultMapping(assessment);

    const chillerInputVector: ChillerInputV = this._createChillerInputVector(assessment.inventory, assessment.systemInformation.operations.doChillerLoadSchedulesVary, suiteModificationArgs);
    const towerInputInstance: SuiteTowerInput = this._createTowerInput(assessment.systemInformation.towerInput);
    const waterCooledSystemInputInstance: SuiteWaterCooledSystemInput = this._createWaterCooledSystemInput(assessment.systemInformation.waterCooledSystemInput, assessment.systemInformation.operations, assessment.systemInformation.condenserWaterPumpInput, assessment.systemInformation.towerInput);
    const processCoolingInstance: ProcessCooling = this._createProcessCoolingInput(chillerInputVector, waterCooledSystemInputInstance, assessment, weatherData, towerInputInstance);

    results.chiller = this._getChillerOutput(processCoolingInstance, assessment.inventory);
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
   * @param weatherData {WeatherContextData} - Weather data for the location of the system.
   * @param suiteModificationArgs {SuiteModificationArgs} - (Optional) Arguments to determine if and how to modify inputs for modification scenarios, such as changing refrigerant type
   * @returns ProcessCoolingResults - Object with:
   *  - chiller: ProcessCoolingChillerOutput[] - Array of chiller outputs
   *  - pump: ProcessCoolingPumpOutput - Pump energy outputs
   */
  getAirCooledResults(assessment: ProcessCoolingAssessment, weatherData: WeatherContextData, suiteModificationArgs?: SuiteModificationArgs): ProcessCoolingResults {
    let results: ProcessCoolingResults = {
      id: undefined,
      fuelCost: assessment.systemInformation.operations.fuelCost,
      electricityCost: assessment.systemInformation.operations.electricityCost,
      name: assessment.name,
      chiller: undefined as ProcessCoolingChillerOutput[],
      pump: undefined as ProcessCoolingPumpOutput,
    };

    this.setChillerDataResultMapping(assessment);

    const chillerInputVector: ChillerInputV = this._createChillerInputVector(assessment.inventory, assessment.systemInformation.operations.doChillerLoadSchedulesVary, suiteModificationArgs);
    const airCooledSystemInputInstance: SuiteAirCooledSystemInput = this._createAirCooledSystemInput(assessment.systemInformation.airCooledSystemInput, assessment.systemInformation.operations);
    const processCoolingInstance: ProcessCooling = this._createProcessCoolingInput(chillerInputVector, airCooledSystemInputInstance, assessment, weatherData);

    results.chiller = this._getChillerOutput(processCoolingInstance, assessment.inventory);
    results.pump = this.getAirCooledPumpEnergy(assessment, processCoolingInstance);

    processCoolingInstance.delete();
    chillerInputVector.delete();
    airCooledSystemInputInstance.delete();
    return results;
  }

  setChillerDataResultMapping(assessment: ProcessCoolingAssessment) {
    this.chillerInputResultMap = {};
    assessment.inventory.forEach((item, idx) => {
      this.chillerInputResultMap[idx] = { id: item.itemId, name: item.name };
    });
  }

  /**
   * Calculates pump energy for water cooled process cooling system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   * @param processCoolingInstance - Instance of the ProcessCooling module.
   * @returns {ProcessCoolingPumpOutput} Object with:
   *   - chillerPumpingEnergy: number[] (kWh)
   *   - condenserPumpingEnergy: number[] (kWh)
   */
  getWaterCooledPumpEnergy(assessment: ProcessCoolingAssessment, processCoolingInstance: ProcessCooling): ProcessCoolingPumpOutput {
    const pumpInputCWInstance: SuitePumpInput = this._createPumpInput(assessment.systemInformation.condenserWaterPumpInput);
    const pumpCWOutput: ChillerPumpingEnergyOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCWInstance);
    const pumpInputCHWInstance: SuitePumpInput = this._createPumpInput(assessment.systemInformation.chilledWaterPumpInput);
    const pumpCWHOutput: ChillerPumpingEnergyOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCHWInstance);

    let chillerPumpingEnergy: PumpChillerItemEnergy[] = this.suiteApiHelperService.extractWASMArray(pumpCWHOutput.chillerPumpingEnergy).map((energy, idx) => {
      return {
        id: this.chillerInputResultMap[idx]?.id ?? `chiller-${idx + 1}`, 
        name: this.chillerInputResultMap[idx]?.name ?? `Chiller ${idx + 1}`, 
        value: energy
      };
    });

    let condenserPumpingEnergy: PumpChillerItemEnergy[] = this.suiteApiHelperService.extractWASMArray(pumpCWOutput.chillerPumpingEnergy).map((energy, idx) => {
      return {
        id: this.chillerInputResultMap[idx]?.id ?? `chiller-${idx + 1}`, 
        name: this.chillerInputResultMap[idx]?.name ?? `Chiller ${idx + 1}`, 
        value: energy
      };
    });

    const result: ProcessCoolingPumpOutput = {
      chillerPumpingEnergy: chillerPumpingEnergy,
      condenserPumpingEnergy: condenserPumpingEnergy
    };

    pumpCWHOutput.delete();
    pumpCWOutput.delete();
    pumpInputCHWInstance.delete();
    return result;
  }


  /**
   * Calculates pump energy for air cooled process cooling system.
   * @param assessment {ProcessCoolingAssessment} - Assessment input object.
   * @param processCoolingInstance - Instance of the ProcessCooling module.
   * @returns {ProcessCoolingPumpOutput} Object with:
   *   - chillerPumpingEnergy: number[] (kWh)
   */
  getAirCooledPumpEnergy(assessment: ProcessCoolingAssessment, processCoolingInstance: ProcessCooling): ProcessCoolingPumpOutput {
    // assessment.systemInformation.condenserWaterPumpInput.variableFlow = false; // used in water-cooled systems only
    // assessment.systemInformation.condenserWaterPumpInput.flowRate = 0; // used in water-cooled systems only
    const pumpInputCHWInstance: SuitePumpInput = this._createPumpInput(assessment.systemInformation.chilledWaterPumpInput);
    const pumpCWHOutput: ChillerPumpingEnergyOutput = processCoolingInstance.calculatePumpEnergy(pumpInputCHWInstance);

    let chillerPumpingEnergy: PumpChillerItemEnergy[] = this.suiteApiHelperService.extractWASMArray(pumpCWHOutput.chillerPumpingEnergy).map((energy, idx) => {
      return {
        id: this.chillerInputResultMap[idx]?.id ?? `chiller-${idx + 1}`, 
        name: this.chillerInputResultMap[idx]?.name ?? `Chiller ${idx + 1}`, 
        value: energy
      };
    });

    const result: ProcessCoolingPumpOutput = {
      chillerPumpingEnergy: chillerPumpingEnergy,
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
  getTowerEnergy(processCoolingInstance: ProcessCooling): ProcessCoolingTowerOutput {
    const towerOutput: TowerOutput = processCoolingInstance.calculateTowerEnergy();
    const result: ProcessCoolingTowerOutput = {
      hours: this.suiteApiHelperService.extractWASMArray(towerOutput.hours),
      energy: this.suiteApiHelperService.extractWASMArray(towerOutput.energy)
    };
    // console.log('towerOutput hours total', result.hours.reduce((a, b) => a + b, 0));
    towerOutput.delete();
    return result;
  }

  /**
   * Creates a Module.ChillerInputV vector and populates it with Module.ChillerInput instances.
   * @param chillerInventoryItems {ChillerInventoryItem[]} - Array of chiller inventory items.
   * @param doChillerLoadSchedulesVary {boolean} - Whether chiller load schedules vary by month, used to determine how to structure chiller loading input for the suite API
   * @param suiteModificationArgs {SuiteModificationArgs} - (Optional) Arguments to determine if and how to modify chiller inputs for modification scenarios, such as changing refrigerant type
   * @returns Module.ChillerInputV instance
   */
  private _createChillerInputVector(chillerInventoryItems: ChillerInventoryItem[], doChillerLoadSchedulesVary: boolean, suiteModificationArgs?: SuiteModificationArgs): ChillerInputV {
    const chillers: ChillerInputV = new this.toolsSuiteApiService.ToolsSuiteModule.ChillerInputV();

    for (const input of chillerInventoryItems as ChillerInventoryItem[]) {
      const loadSchedule: Array<Array<number>> = input.useSameMonthlyLoading ? [input.loadScheduleAllMonths] : input.loadScheduleByMonth;
      const chillerMonthlyLoading: DoubleVector2D = this.suiteApiHelperService.returnDoubleVector2d(loadSchedule);
      let chiller: SuiteChillerInput;

      // * 8117 refrigerant flow is currently hidden in UI
      if (suiteModificationArgs?.changeRefrig && input.proposedRefrigerantType != null && input.proposedRefrigerantType != undefined) {
        const currentRefrigEnum: RefrigerantType = this.suiteApiHelperService.getProcessCoolingRefrigerantTypeEnum(input.refrigerantType);
        const proposedRefrigEnum: RefrigerantType = this.suiteApiHelperService.getProcessCoolingRefrigerantTypeEnum(input.proposedRefrigerantType);

        chiller = this._createChillerInputWithRefrigChange(
          this.suiteApiHelperService.getProcessCoolingChillerCompressorTypeEnum(input.chillerType),
          input.capacity,
          input.isFullLoadEfficiencyKnown,
          input.fullLoadEfficiency,
          input.age,
          input.installVSD,
          input.useARIloadScheduleByMonthchedule,
          chillerMonthlyLoading,
          true,
          currentRefrigEnum,
          proposedRefrigEnum
        );
      } else if (input.isCustomChiller) {

        const suiteLoadAtPercent: DoubleVector = this.suiteApiHelperService.returnDoubleVector(input.loadAtPercent);
        const suiteKWPerTonAtLoad: DoubleVector = this.suiteApiHelperService.returnDoubleVector(input.kWPerTonAtLoad);

        chiller = this._createChillerInputWithCustomCurve(
          this.suiteApiHelperService.getProcessCoolingChillerCompressorTypeEnum(input.chillerType),
          input.capacity,
          input.isFullLoadEfficiencyKnown,
          input.fullLoadEfficiency,
          input.age,
          input.installVSD,
          input.useARIloadScheduleByMonthchedule,
          chillerMonthlyLoading,
          suiteLoadAtPercent,
          suiteKWPerTonAtLoad
        );
      }else {
        chiller = this._createChillerInput(
          this.suiteApiHelperService.getProcessCoolingChillerCompressorTypeEnum(input.chillerType),
          input.capacity,
          input.isFullLoadEfficiencyKnown,
          input.fullLoadEfficiency,
          input.age,
          input.installVSD,
          input.useARIloadScheduleByMonthchedule,
          chillerMonthlyLoading
        );
      }

      chillers.push_back(chiller);
      chiller.delete();
      chillerMonthlyLoading.delete();
    }
    return chillers;
  }

  /**
   * Creates a `ProcessCooling` instance from inputs and location based weather data
   *
   * @param chillerInputVector - Vector of chiller inputs (Module.ChillerInputV)
   * @param coolingMethodSystemInputInstance - Air or water cooled system input (Module.AirCooledSystemInput or Module.WaterCooledSystemInput)
   * @param towerInputInstance - Optional tower input (Module.TowerInput)
   * @returns A new `ProcessCooling` instance
   */
  private _createProcessCoolingInput(
    chillerInputVector: ChillerInputV,
    coolingMethodSystemInputInstance: SuiteAirCooledSystemInput | SuiteWaterCooledSystemInput,
    processCoolingAssessment: ProcessCoolingAssessment,
    weatherData: WeatherContextData,
    towerInputInstance?: SuiteTowerInput): ProcessCooling {
    const dryBulbHourly: (number)[] = [];
    const wetBulbHourly: (number)[] = [];

    // * keep below for debugging future implementation with interpolation of missign data
    let wetbulbUndefined: number = 0;
    let dryBulbUndefined: number = 0;
    
    for (const hour of weatherData.weatherDataPoints) {
      if (hour.wet_bulb_temp == undefined) {
        // console.log('hour undefined', hour);
        wetbulbUndefined++;
        hour.wet_bulb_temp = 0;
      } else if (hour.dry_bulb_temp == undefined) {
        // console.log('hour undefined', hour);
        dryBulbUndefined++;
        hour.dry_bulb_temp = 0;
      }
      dryBulbHourly.push(hour.dry_bulb_temp);
      wetBulbHourly.push(hour.wet_bulb_temp);
    }

    // console.log('Number Wet Bulb datapoints undefined:', wetbulbUndefined);
    // console.log('Number Dry Bulb datapoints undefined:', dryBulbUndefined);

    // * test values
    // let onHoursVector = new this.toolsSuiteApiService.ToolsSuiteModule.IntVector();
    // getSysOpAnnualHours(const vector<int>& weeklyOpStartHour, const vector<int>& weeklyOpStopHour, const vector<int>& monthlyOpMaxHour)
    // const pc = new this.toolsSuiteApiService.ToolsSuiteModule.ProcessCooling();
    // console.log(dryBulbHourlyTempVector.size());
    // let debug = this._extractArray(dryBulbHourlyTempVector);
    // console.log(debug);
    // dryBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(drybulbValues);
    // wetBulbHourlyTempVector = this.suiteApiHelperService.returnDoubleVector(wetbulbValues);


    const startHoursWeekly: Array<number> = processCoolingAssessment.weeklyOperatingSchedule.days.map(day => day.start);
    const stopHoursWeekly: Array<number> = processCoolingAssessment.weeklyOperatingSchedule.days.map(day => day.end);

    const startHoursVector: IntVector = this.suiteApiHelperService.returnIntVector(startHoursWeekly);
    const stopHoursVector: IntVector = this.suiteApiHelperService.returnIntVector(stopHoursWeekly);
    const monthlyOpMaxHoursVector: IntVector = this.suiteApiHelperService.returnIntVector(processCoolingAssessment.monthlyOperatingSchedule.hoursOnPerMonth);
    
    const systemAnnualOnHours: IntVector = this.toolsSuiteApiService.ToolsSuiteModule.ProcessCooling.getSysOpAnnualHours(
      startHoursVector,
      stopHoursVector,
      monthlyOpMaxHoursVector
    );
    const dryBulbHourlyTempVector: DoubleVector = this.suiteApiHelperService.returnDoubleVector(dryBulbHourly);
    const wetBulbHourlyTempVector: DoubleVector = this.suiteApiHelperService.returnDoubleVector(wetBulbHourly);
    const debugSystemAnnualOnHours: Array<number> = this.suiteApiHelperService.extractWASMArray(systemAnnualOnHours);

    // console.log(debugSystemAnnualOnHours);
    // console.log(dryBulbHourly);
    // console.log(wetBulbHourly);

    let processCoolingInstance: ProcessCooling;
    if (!towerInputInstance) {
      processCoolingInstance = this.createProcessCoolingAirCooled(
        systemAnnualOnHours,
        dryBulbHourlyTempVector,
        wetBulbHourlyTempVector,
        chillerInputVector,
        coolingMethodSystemInputInstance as SuiteAirCooledSystemInput
      );
    } else {
      processCoolingInstance = this.createProcessCoolingWaterCooled(
        systemAnnualOnHours,
        dryBulbHourlyTempVector,
        wetBulbHourlyTempVector,
        chillerInputVector,
        towerInputInstance,
        coolingMethodSystemInputInstance as SuiteWaterCooledSystemInput
      );
    }

    startHoursVector.delete();
    stopHoursVector.delete();
    monthlyOpMaxHoursVector.delete();
    dryBulbHourlyTempVector.delete();
    wetBulbHourlyTempVector.delete();
    systemAnnualOnHours.delete();

    return processCoolingInstance;

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
   * @returns Module.WaterCooledSystemInput instance
   */
  private _createWaterCooledSystemInput(input: WaterCooledSystemInput, operations: Operations, condenserPumpInput: PumpInput, towerInput: TowerInput): SuiteWaterCooledSystemInput {

      return new this.toolsSuiteApiService.ToolsSuiteModule.WaterCooledSystemInput(
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
   * @returns Module.AirCooledSystemInput instance
   */
  private _createAirCooledSystemInput(input: AirCooledSystemInput, operations: Operations): SuiteAirCooledSystemInput {
    const ACSource: ACSourceLocation = this.suiteApiHelperService.getProcessCoolingCoolingAirSourceEnum(input.airCoolingSource);
    // console.log('AirCooledSystemInput Inputs:');
    // console.log('chilledWaterSupplyTemp:', operations.chilledWaterSupplyTemp);
    // console.log('outdoorAirTemp (Outdoor Air Design Temp):', input.outdoorAirTemp);
    // console.log('ACSource (Cooling Air Source):', ACSource);
    // console.log('indoorTemp (Average Indoor Temp):', input.indoorTemp);
    // console.log('followingTempDifferential:', input.followingTempDifferential);

    return new this.toolsSuiteApiService.ToolsSuiteModule.AirCooledSystemInput(
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
  private _getChillerOutput(processCoolingInstance: ProcessCooling, chillerInventoryItems: ChillerInventoryItem[]): ProcessCoolingChillerOutput[] {
    const chillerOutputInstance: ChillerOutput = processCoolingInstance.calculateChillerEnergy();
    const chillerOutput: ProcessCoolingChillerOutput[] = [];
    const numChillers: number = chillerOutputInstance.efficiency.size();

    for (let i: number = 0; i < numChillers; i++) {
      const hours: Array<number> = this.suiteApiHelperService.extractWASMArray(chillerOutputInstance.hours.get(i));
      const energy: Array<number> = this.suiteApiHelperService.extractWASMArray(chillerOutputInstance.energy.get(i));
      const power: Array<number> = this.suiteApiHelperService.extractWASMArray(chillerOutputInstance.power.get(i));

      const defaultLoads: Array<number> = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      let loadPercents: DoubleVector = this.suiteApiHelperService.returnDoubleVector(defaultLoads);
      let curveLoadPercents: Array<number> = defaultLoads;
      if (chillerInventoryItems[i].isCustomChiller) {
        curveLoadPercents = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
      }
      const suiteCurveLoadPercents: DoubleVector = this.suiteApiHelperService.returnDoubleVector(curveLoadPercents);

      // * used for table data
      const efficiencyAtLoadWasm: DoubleVector = processCoolingInstance.getChillerEnergyEfficiency(i, loadPercents);
      const efficiencyAtLoad: Array<number> = this.suiteApiHelperService.extractWASMArray(efficiencyAtLoadWasm);

      // * used to visualize performance curve
      const curveEfficiencyAtLoadWasm: DoubleVector = processCoolingInstance.getChillerEnergyEfficiency(i, suiteCurveLoadPercents);
      const curveEfficiencyAtLoad: Array<number> = this.suiteApiHelperService.extractWASMArray(curveEfficiencyAtLoadWasm);

      const chillerResult: ProcessCoolingChillerOutput = {
        id: this.chillerInputResultMap[i]?.id ?? `chiller-${i + 1}`,
        name: this.chillerInputResultMap[i]?.name ?? `Chiller ${i + 1}`,
        efficiency: efficiencyAtLoad,
        ariEfficiencyProfile: curveEfficiencyAtLoad,
        loadPercents: curveLoadPercents,
        hours: hours,
        power: power,
        energy: energy,
        totalHours: hours.reduce((a, b) => a + b, 0),
        totalEnergy: energy.reduce((a, b) => a + b, 0)
      };
      chillerOutput.push(chillerResult);
      suiteCurveLoadPercents.delete();
      loadPercents.delete();
      efficiencyAtLoadWasm.delete();
      curveEfficiencyAtLoadWasm.delete();
    }

    chillerOutputInstance.delete();
    return chillerOutput;
  }

  /**
   * Extracts a number array from a WASM vector.
   * @param vector - The WASM vector to extract from.
   * @returns A number array containing the values from the vector.
   */
  private createProcessCoolingWaterCooled(onHoursVector: IntVector,
    dryBulbHourlyTempVector: DoubleVector,
    wetBulbHourlyTempVector: DoubleVector,
    chillerInputVector: ChillerInputV,
    towerInputInstance: SuiteTowerInput,
    coolingMethodSystemInputInstance: SuiteWaterCooledSystemInput): ProcessCooling {
    return new this.toolsSuiteApiService.ToolsSuiteModule.ProcessCooling(
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
  private createProcessCoolingAirCooled(onHoursVector: IntVector,
    dryBulbHourlyTempVector: DoubleVector,
    wetBulbHourlyTempVector: DoubleVector,
    chillerInputVector: ChillerInputV,
    coolingMethodSystemInputInstance: SuiteAirCooledSystemInput): ProcessCooling {
    return new this.toolsSuiteApiService.ToolsSuiteModule.ProcessCooling(
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
  private _createChillerInput(chillerInputType: ChillerCompressorType,
        capacity: number,
        isFullLoadEffKnown: boolean,
        fullLoadEff: number,
        age: number,
        installVSD: boolean,
        useARIloadScheduleByMonthchedule: boolean,
        chillerMonthlyLoad2D: DoubleVector2D): SuiteChillerInput {
    return new this.toolsSuiteApiService.ToolsSuiteModule.ChillerInput(
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
  *
  * @details Use this constructor when replacing chiller refrigerant
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
  * @property changeRefrig boolean, should track with useOpportunity for refrigeration change
  * @property currentRefrig Enumeration RefrigerantType
  * @property proposedRefrig Enumeration RefrigerantType
  */
  private _createChillerInputWithRefrigChange(chillerInputType: ChillerCompressorType,
        capacity: number,
        isFullLoadEffKnown: boolean,
        fullLoadEff: number,
        age: number,
        installVSD: boolean,
        useARIloadScheduleByMonthchedule: boolean,
        chillerMonthlyLoad2D: DoubleVector2D,
        changeRefrig: boolean,
        currentRefrig: RefrigerantType,
        proposedRefrig: RefrigerantType): SuiteChillerInput {
        
    return new this.toolsSuiteApiService.ToolsSuiteModule.ChillerInput(
      chillerInputType,
      capacity,
      isFullLoadEffKnown,
      fullLoadEff,
      age,
      installVSD,
      useARIloadScheduleByMonthchedule,
      chillerMonthlyLoad2D,
      changeRefrig,
      currentRefrig,
      proposedRefrig
    );
  }


  /**
  *
  * @details Use this constructor to define custom Chiller
  *
  * @author Suite constructor param names
  * @param chillerType Enumeration ChillerCompressorType
  * @param capacity double, @unit{\ton}
  * @param isFullLoadEffKnown boolean, Is full load efficiency known? for this Chiller
  * @param fullLoadEff double, fraction, 0.2 - 2.5 increments of .01
  * @param age double # of years, 0 - 20, (can be 1.5 for eighteen months), assumption chiller efficiency is
  * degraded by 1% / year
  * @param installVSD boolean, Install a VSD on each Centrifugal Compressor Motor
  * @param useARIMonthlyLoadSchedule boolean, if true monthlyLoads not needed and can be set to empty
  * @param monthlyLoads double, 12x11 array of 11 %load bins (0,10,20,30,40,50,60,70,80,90,100) for 12 calendar
  * months In case of non varying monthly loads expects a 1X11 array of 11 %load bins
  *
  * @param loadAtPercent double array, % loading
  * @param kwPerTonLoads double array, kW/ton at the corresponding % loading
  */
  private _createChillerInputWithCustomCurve(
    chillerType: ChillerCompressorType,
    capacity: number,
    isFullLoadEffKnown: boolean,
    fullLoadEff: number,
    age: number,
    installVSD: boolean,
    useARIMonthlyLoadSchedule: boolean,
    monthlyLoads: DoubleVector2D,
    loadAtPercent: DoubleVector,
    kwPerTonLoads: DoubleVector
  ): SuiteChillerInput {
    return new this.toolsSuiteApiService.ToolsSuiteModule.ChillerInput(
      chillerType,
      capacity,
      isFullLoadEffKnown,
      fullLoadEff,
      age,
      installVSD,
      useARIMonthlyLoadSchedule,
      monthlyLoads,
      loadAtPercent,
      kwPerTonLoads
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
   * @returns Module.PumpInput instance
   */
  private _createPumpInput(input: PumpInput): SuitePumpInput {
    const efficiencyFraction: number = input.efficiency / 100;
    const motorEfficiencyFraction: number = input.motorEfficiency / 100;
    return new this.toolsSuiteApiService.ToolsSuiteModule.PumpInput(
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
   * @returns Module.TowerInput instance
   */
  private _createTowerInput(input: TowerInput): SuiteTowerInput {
    const fanSpeedTypeEnum: FanMotorSpeedType = this.suiteApiHelperService.getProcessCoolingFanMotorSpeedTypeEnum(input.fanSpeedType)
    const towerSizingEnum: TowerSizedBy = this.suiteApiHelperService.getProcessCoolingTowerSizedByEnum(input.towerSizeMetric)
    const towerCellFanTypeEnum: CellFanType = this.suiteApiHelperService.getProcessCoolingFanTypeEnum(input.fanType)

    // * towerSize is passed twice because the suite asks for both cellFanHP and tonnage. UI model does not require separate properties for this.
    return new this.toolsSuiteApiService.ToolsSuiteModule.TowerInput(
      input.numberOfTowers,
      input.numberOfFans,
      fanSpeedTypeEnum,
      towerSizingEnum,
      towerCellFanTypeEnum,
      input.towerSize,
      input.towerSize
    );
  }

}

/**
 * Some suite constructors require specific args to output modification results
 * 
 * @changeRefrig boolean - should track with useOpportunity for refrigeration change. Required even to handle chillers with non null proposed refrigerant, but useOpportunity == false; 
 */
export interface SuiteModificationArgs {
  changeRefrig?: boolean;
}
