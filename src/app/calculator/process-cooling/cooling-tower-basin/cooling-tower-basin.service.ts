import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { CoolingTowerBasinInput, CoolingTowerBasinOutput, CoolingTowerBasinResult, WeatherBinnedResult } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { WeatherBinCase, WeatherBinsInput, WeatherBinsService } from '../../utilities/weather-bins/weather-bins.service';
import { CoolingTowerBasinFormService } from './cooling-tower-basin-form.service';
import * as _ from 'lodash';
import { CoolingChartData } from '../../../shared/cooling-weather-chart/cooling-weather-chart.component';
import { ChillersSuiteApiService } from '../../../tools-suite-api/chillers-suite-api.service';

@Injectable()
export class CoolingTowerBasinService {

  coolingTowerBasinInput: BehaviorSubject<CoolingTowerBasinInput>;
  coolingTowerBasinOutput: BehaviorSubject<CoolingTowerBasinOutput>;
  selectedWeatherBinResult: WeatherBinnedResult;
  
  isShowingWeatherResults: BehaviorSubject<boolean>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  hasWeatherBinsData: BehaviorSubject<boolean>;

  constructor(private convertUnitsService: ConvertUnitsService,
    private chillersSuiteApiService: ChillersSuiteApiService,
    private weatherBinsService: WeatherBinsService, private coolingTowerBasinFormService: CoolingTowerBasinFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.coolingTowerBasinInput = new BehaviorSubject<CoolingTowerBasinInput>(undefined);
    this.coolingTowerBasinOutput = new BehaviorSubject<CoolingTowerBasinOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.isShowingWeatherResults = new BehaviorSubject<boolean>(undefined);
    this.setHasWeatherBinsData();
  }

  setHasWeatherBinsData() {
    let weatherBinsData = this.weatherBinsService.inputData.getValue();
    let hasWeatherBinsData = weatherBinsData && weatherBinsData.totalDataPoints > 0;
    if (!this.hasWeatherBinsData) {
      this.hasWeatherBinsData = new BehaviorSubject<boolean>(hasWeatherBinsData);
    } else {
      if (hasWeatherBinsData !== this.hasWeatherBinsData.getValue())
      this.hasWeatherBinsData.next(hasWeatherBinsData);
    }
  }

  setAsWeatherIntegratedCalculator() {
    let coolingTowerBasinParameters = [
      'Dry-bulb (C)'
      // , 'Wspd (m/s)'
    ]
    this.weatherBinsService.integratedCalculator.next(
      {
        binningParameters: coolingTowerBasinParameters
      }
    );
  }

  resetWeatherIntegratedCalculator() {
    this.weatherBinsService.integratedCalculator.next(undefined);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyInput: CoolingTowerBasinInput = {
      ratedCapacity: 0,
      ratedTempSetPoint: 0,
      ratedTempDryBulb: 0,
      ratedWindSpeed: 0,
      panLossRatio: .011,
      operatingTempDryBulb: 0,
      operatingWindSpeed: 0,
      operatingHours: 0,
      baselineTempSetPoint: 0,
      modTempSetPoint: 0,
      electricityCost: settings.electricityCost
    };
    this.coolingTowerBasinInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: CoolingTowerBasinOutput = {
      results: {
        baselinePower: 0,
        baselineEnergy: 0,
        modPower: 0,
        modEnergy: 0,
        savingsEnergy: 0,
        baselineEnergyCost: 0,
        modEnergyCost: 0,
        annualCostSaving: 0,
      },
    };
    this.coolingTowerBasinOutput.next(emptyOutput);
  }

  calculate(settings: Settings, treasureHuntInputs?: CoolingTowerBasinInput, treasureHuntWeatherData?: WeatherBinsInput) {
    if (treasureHuntWeatherData){
      this.weatherBinsService.inputData.next(treasureHuntWeatherData);
    }
    let coolingTowerBasinInput: CoolingTowerBasinInput;
    let inputCopy: CoolingTowerBasinInput;
    if(!treasureHuntInputs) {
      coolingTowerBasinInput = this.coolingTowerBasinInput.getValue();
      inputCopy = JSON.parse(JSON.stringify(coolingTowerBasinInput));
    } else {
      inputCopy = JSON.parse(JSON.stringify(treasureHuntInputs));
    }
    
    let validInput: boolean;
    validInput = this.coolingTowerBasinFormService.getCoolingTowerBasinForm(inputCopy, settings).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      this.setHasWeatherBinsData();
      if ((this.hasWeatherBinsData.getValue() == true && this.isShowingWeatherResults.getValue() == true) || treasureHuntWeatherData) {
        let weatherBinsData = this.weatherBinsService.inputData.getValue();
        let coolingTowerBasinOutput: CoolingTowerBasinOutput = this.getWeatherBinnedOutput(inputCopy, weatherBinsData, settings);
        this.coolingTowerBasinOutput.next(coolingTowerBasinOutput);
        return coolingTowerBasinOutput;
      } else {
        let coolingTowerBasinResult: CoolingTowerBasinResult = this.chillersSuiteApiService.basinHeaterEnergyConsumption(inputCopy);
        let coolingTowerBasinOutput: CoolingTowerBasinOutput = {results: undefined};
        coolingTowerBasinResult.baselineEnergyCost = coolingTowerBasinResult.baselineEnergy * inputCopy.electricityCost;
        coolingTowerBasinResult.modEnergyCost = coolingTowerBasinResult.modEnergy * inputCopy.electricityCost;
        coolingTowerBasinResult.annualCostSaving = coolingTowerBasinResult.baselineEnergyCost - coolingTowerBasinResult.modEnergyCost;
        coolingTowerBasinOutput.results = this.convertResultUnits(coolingTowerBasinResult, settings);
        this.coolingTowerBasinOutput.next(coolingTowerBasinOutput);
        return coolingTowerBasinOutput;
      }
    }
  }

  getWeatherBinnedOutput(input: CoolingTowerBasinInput, weatherData: WeatherBinsInput, settings: Settings): CoolingTowerBasinOutput {
    let output: CoolingTowerBasinOutput = {
      results: undefined,
      totalResults: {
        baselinePower: 0,
        baselineEnergy: 0,
        modPower: 0,
        modEnergy: 0,
        savingsEnergy: 0,
        baselineEnergyCost: 0,
        modEnergyCost: 0,
        annualCostSaving: 0,
      },
      weatherBinnedResults: [],
      weatherBinnedChartData: {
        barChartDataArray: [],
        yValueUnit: 'kWh',
        yAxisLabel: 'Energy (kWh)',
        parameterUnit: undefined
      }
    };
    let baselineBarData: CoolingChartData = {
      name: 'Baseline',
      barChartLabels: [],
      barChartValues: [],
      chartHourValues: [],
    };
    let modBarData: CoolingChartData = {
      name: 'Modification',
      barChartLabels: [],
      barChartValues: [],
      chartHourValues: [],

    }
    weatherData.cases.forEach(weatherBinCase => {
      let weatherCase: WeatherBinCase = JSON.parse(JSON.stringify(weatherBinCase));
      let weatherBinnedResult: WeatherBinnedResult = {
        caseName: weatherCase.caseName,
        operatingHours: weatherCase.totalNumberOfDataPoints,
        results: undefined
      };

      let label = `${weatherCase.lowerBound} to ${weatherCase.upperBound}`;
      weatherBinnedResult.caseName = `${weatherCase.caseName} (${label} &#8457;)`;
      baselineBarData.barChartLabels.push(label);
      modBarData.barChartLabels.push(label);

        if (weatherCase.field == 'Dry-bulb (C)') {
          let paramDataRange: Array<number> = _.range(weatherCase.lowerBound, weatherCase.upperBound + 1);
          let dryBulbTemp = this.getMedianParameterValue(paramDataRange);

          input.operatingHours = weatherCase.totalNumberOfDataPoints;
          input.operatingTempDryBulb = dryBulbTemp;
          let coolingTowerBasinResult: CoolingTowerBasinResult = this.chillersSuiteApiService.basinHeaterEnergyConsumption(input);
          coolingTowerBasinResult = this.convertResultUnits(coolingTowerBasinResult, settings);
          weatherBinnedResult.results = coolingTowerBasinResult;
          output.weatherBinnedResults.push(weatherBinnedResult);

          output.totalResults.baselineEnergy += coolingTowerBasinResult.baselineEnergy;
          output.totalResults.modEnergy += coolingTowerBasinResult.modEnergy;

          baselineBarData.barChartValues.push(coolingTowerBasinResult.baselineEnergy);
          baselineBarData.chartHourValues.push(weatherCase.totalNumberOfDataPoints);
          modBarData.barChartValues.push(coolingTowerBasinResult.modEnergy);
          modBarData.chartHourValues.push(weatherCase.totalNumberOfDataPoints);
        }
    });

    output.totalResults.savingsEnergy = output.totalResults.baselineEnergy - output.totalResults.modEnergy;
    output.totalResults.baselineEnergyCost = output.totalResults.baselineEnergy * input.electricityCost;
    output.totalResults.modEnergyCost = output.totalResults.modEnergy * input.electricityCost;
    output.totalResults.annualCostSaving = output.totalResults.baselineEnergyCost - output.totalResults.modEnergyCost;
    output.weatherBinnedChartData.barChartDataArray = [baselineBarData, modBarData];
    if (settings.unitsOfMeasure == 'Imperial') {
      output.weatherBinnedChartData.parameterUnit = '&#8457;';
    } else {
      output.weatherBinnedChartData.parameterUnit = '&#8451;';
    }
    return output;
  }

  getMedianParameterValue(paramDataRange: Array<number>) {
      const midIndex = Math.floor(paramDataRange.length / 2);
      let isEvenLength: boolean = paramDataRange.length % 2 === 0;
      if (isEvenLength) {
        let avgOfMiddle: number = (paramDataRange[midIndex - 1] + paramDataRange[midIndex]) / 2; 
          return avgOfMiddle;
      }
      return paramDataRange[midIndex];
  }


  generateExampleData(settings: Settings) {
    let exampleInput: CoolingTowerBasinInput = {
      ratedCapacity: 1201.67,
      ratedTempSetPoint: 40,
      ratedTempDryBulb: -10,
      ratedWindSpeed: 10,
      panLossRatio: .011,
      operatingTempDryBulb: 28,
      operatingWindSpeed: 9.21,
      operatingHours: 1,
      baselineTempSetPoint: 40,
      modTempSetPoint: 39,
      electricityCost: settings.electricityCost
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.coolingTowerBasinInput.next(exampleInput);
  }
  
  convertExampleUnits(input: CoolingTowerBasinInput): CoolingTowerBasinInput {
    input.ratedTempSetPoint = this.convertUnitsService.value(input.ratedTempSetPoint).from('F').to('C');
    input.ratedTempSetPoint = this.roundVal(input.ratedTempSetPoint, 2);

    input.ratedTempDryBulb = this.convertUnitsService.value(input.ratedTempDryBulb).from('F').to('C');
    input.ratedTempDryBulb = this.roundVal(input.ratedTempDryBulb, 2);
    
    input.ratedWindSpeed = this.convertUnitsService.value(input.ratedWindSpeed).from('mph').to('km/h');
    input.ratedWindSpeed = this.roundVal(input.ratedWindSpeed, 2);

    input.operatingTempDryBulb = this.convertUnitsService.value(input.operatingTempDryBulb).from('F').to('C');
    input.operatingTempDryBulb = this.roundVal(input.operatingTempDryBulb, 2);

    input.operatingWindSpeed = this.convertUnitsService.value(input.operatingWindSpeed).from('mph').to('km/h');
    input.operatingWindSpeed = this.roundVal(input.operatingWindSpeed, 2);

    input.baselineTempSetPoint = this.convertUnitsService.value(input.baselineTempSetPoint).from('F').to('C');
    input.baselineTempSetPoint = this.roundVal(input.baselineTempSetPoint, 2);

    input.modTempSetPoint = this.convertUnitsService.value(input.modTempSetPoint).from('F').to('C');
    input.modTempSetPoint = this.roundVal(input.modTempSetPoint, 2);

    input.ratedCapacity = this.convertUnitsService.value(input.ratedCapacity).from('tons').to('kW');
    input.ratedCapacity = this.roundVal(input.ratedCapacity, 2);

    return input;
  }

  convertInputUnits(input: CoolingTowerBasinInput, settings: Settings): CoolingTowerBasinInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.ratedCapacity = this.convertUnitsService.value(input.ratedCapacity).from('kW').to('tons');
      input.ratedTempSetPoint = this.convertUnitsService.value(input.ratedTempSetPoint).from('C').to('F');
      input.ratedTempDryBulb = this.convertUnitsService.value(input.ratedTempDryBulb).from('C').to('F');
      input.operatingTempDryBulb = this.convertUnitsService.value(input.operatingTempDryBulb).from('C').to('F');
      input.baselineTempSetPoint = this.convertUnitsService.value(input.baselineTempSetPoint).from('C').to('F');
      input.modTempSetPoint = this.convertUnitsService.value(input.modTempSetPoint).from('C').to('F');
    }
    if (settings.unitsOfMeasure == 'Imperial') {
      input.operatingWindSpeed = this.convertUnitsService.value(input.operatingWindSpeed).from('mph').to('km/h');
      input.ratedWindSpeed = this.convertUnitsService.value(input.ratedWindSpeed).from('mph').to('km/h');
    }
    return input;
  }

  convertResultUnits(result: CoolingTowerBasinResult, settings: Settings): CoolingTowerBasinResult {
    if (settings.unitsOfMeasure == "Metric") {
      result.baselinePower = this.convertUnitsService.value(result.baselinePower).from('hp').to('kW');
      result.baselinePower = this.roundVal(result.baselinePower, 2);

      result.modPower = this.convertUnitsService.value(result.modPower).from('hp').to('kW');
      result.modPower = this.roundVal(result.modPower, 2);
    }

    return result;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
