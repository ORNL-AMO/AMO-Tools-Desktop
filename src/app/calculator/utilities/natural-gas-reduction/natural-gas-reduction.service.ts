import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { StandaloneService } from '../../standalone.service';
import {
  NaturalGasReductionData, FlowMeterMethodData, NaturalGasOtherMethodData, AirMassFlowMeasuredData,
  AirMassFlowNameplateData, AirMassFlowData, WaterMassFlowData, NaturalGasReductionInput, NaturalGasReductionResults, NaturalGasReductionResult
} from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class NaturalGasReductionService {

  baselineData: Array<NaturalGasReductionData>;
  modificationData: Array<NaturalGasReductionData>;
  operatingHours: OperatingHours;
  constructor(private fb: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  // resetData(settings: Settings) {
  //   this.baselineData = new Array<NaturalGasReductionData>();
  //   this.modificationData = new Array<NaturalGasReductionData>();
  //   this.baselineData.push(this.initObject(0, settings));
  // }

  initObject(index: number, settings: Settings, operatingHours: OperatingHours): NaturalGasReductionData {
    let defaultFlowMeterData: FlowMeterMethodData = {
      flowRate: 5
    };
    let defaultOtherData: NaturalGasOtherMethodData = {
      consumption: 89900.00
    };
    let defaultAirMassFlowMeasuredData: AirMassFlowMeasuredData = {
      areaOfDuct: 5,
      airVelocity: 10
    };
    let defaultAirMassFlowNameplateData: AirMassFlowNameplateData = {
      airFlow: 50
    };
    let defaultAirMassFlowData: AirMassFlowData = {
      isNameplate: true,
      airMassFlowMeasuredData: defaultAirMassFlowMeasuredData,
      airMassFlowNameplateData: defaultAirMassFlowNameplateData,
      inletTemperature: 25,
      outletTemperature: 40,
      systemEfficiency: 80
    };
    let defaultWaterMassFlowData: WaterMassFlowData = {
      waterFlow: 25,
      inletTemperature: 25,
      outletTemperature: 40,
      systemEfficiency: 80
    };
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let fuelCost: number = .12;
    if (settings && settings.fuelCost) {
      fuelCost = settings.fuelCost;
    }
    let obj: NaturalGasReductionData = {
      name: 'Equipment #' + (index + 1),
      operatingHours: hoursPerYear,
      fuelCost: fuelCost,
      measurementMethod: 0,
      flowMeterMethodData: defaultFlowMeterData,
      otherMethodData: defaultOtherData,
      airMassFlowData: defaultAirMassFlowData,
      waterMassFlowData: defaultWaterMassFlowData,
      units: 1
    }
    return obj;
  }

  generateExample(settings: Settings, isBaseline: boolean): NaturalGasReductionData {
    let flowRate: number = isBaseline ? 5 : 4
    if (settings.unitsOfMeasure !== 'Imperial') {
      flowRate = this.convertUnitsService.roundVal(this.convertUnitsService.value(flowRate).from('ft3').to('m3'), 2);
    }
    let exampleFlowMeterData: FlowMeterMethodData = {
      flowRate: flowRate
    };
    let exampleOtherData: NaturalGasOtherMethodData = {
      consumption: 89900.00
    };
    let exampleAirMassFlowMeasuredData: AirMassFlowMeasuredData = {
      areaOfDuct: 5,
      airVelocity: 10
    };
    let exampleAirMassFlowNameplateData: AirMassFlowNameplateData = {
      airFlow: 50
    };
    let exampleAirMassFlowData: AirMassFlowData = {
      isNameplate: true,
      airMassFlowMeasuredData: exampleAirMassFlowMeasuredData,
      airMassFlowNameplateData: exampleAirMassFlowNameplateData,
      inletTemperature: 25,
      outletTemperature: 40,
      systemEfficiency: 80
    };
    let exampleWaterMassFlowData: WaterMassFlowData = {
      waterFlow: 25,
      inletTemperature: 25,
      outletTemperature: 40,
      systemEfficiency: 80
    };
    let obj: NaturalGasReductionData = {
      name: 'Equipment #1',
      operatingHours: 6000,
      fuelCost: 4.99,
      measurementMethod: 0,
      flowMeterMethodData: exampleFlowMeterData,
      otherMethodData: exampleOtherData,
      airMassFlowData: exampleAirMassFlowData,
      waterMassFlowData: exampleWaterMassFlowData,
      units: 1
    }
    return obj;
  }

  getFormFromObj(obj: NaturalGasReductionData): UntypedFormGroup {
    let form: UntypedFormGroup = this.fb.group({
      name: [obj.name, Validators.required],
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [obj.fuelCost, [Validators.required, Validators.min(0)]],
      measurementMethod: [obj.measurementMethod],

      // flow meter method data
      flowRate: [obj.flowMeterMethodData.flowRate],

      // other method data
      consumption: [obj.otherMethodData.consumption],

      // air mass flow data
      isNameplate: [obj.airMassFlowData.isNameplate],
      //    air mass flow measured data
      areaOfDuct: [obj.airMassFlowData.airMassFlowMeasuredData.areaOfDuct],
      airVelocity: [obj.airMassFlowData.airMassFlowMeasuredData.airVelocity],
      //    air mass flow nameplate data
      airFlow: [obj.airMassFlowData.airMassFlowNameplateData.airFlow],

      airInletTemperature: [obj.airMassFlowData.inletTemperature],
      airOutletTemperature: [obj.airMassFlowData.outletTemperature],
      airSystemEfficiency: [obj.airMassFlowData.systemEfficiency],

      // water mass flow method
      waterFlow: [obj.waterMassFlowData.waterFlow],
      waterInletTemperature: [obj.waterMassFlowData.inletTemperature],
      waterOutletTemperature: [obj.waterMassFlowData.outletTemperature],
      waterSystemEfficiency: [obj.waterMassFlowData.systemEfficiency],

      units: [obj.units, [Validators.required, Validators.min(0)]]
    });
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: UntypedFormGroup): UntypedFormGroup {
    switch (form.controls.measurementMethod.value) {
      case 0:
        form.controls.flowRate.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 1:
        // air mass flow
        form.controls.isNameplate.setValidators([Validators.required]);
        switch (form.controls.isNameplate.value) {
          // air mass flow measured data
          case false:
            form.controls.areaOfDuct.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
            form.controls.airVelocity.setValidators([Validators.required, Validators.min(0)]);
            break;
          case true:
            form.controls.airFlow.setValidators([Validators.required, Validators.min(0)]);
            break;
        }
        form.controls.airInletTemperature.setValidators([Validators.required]);
        form.controls.airOutletTemperature.setValidators([Validators.required]);
        form.controls.airSystemEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        break;
      // water mass flow
      case 2:
        form.controls.waterFlow.setValidators([Validators.required, Validators.min(0)]);
        form.controls.waterInletTemperature.setValidators([Validators.required]);
        form.controls.waterOutletTemperature.setValidators([Validators.required]);
        form.controls.waterSystemEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        break;
      // other method
      case 3:
        form.controls.consumption.setValidators([Validators.required, Validators.min(0)]);
        break;
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): NaturalGasReductionData {
    let flowMeterMethodData: FlowMeterMethodData = {
      flowRate: form.controls.flowRate.value
    };
    let airMassFlowMeasuredData: AirMassFlowMeasuredData = {
      areaOfDuct: form.controls.areaOfDuct.value,
      airVelocity: form.controls.airVelocity.value
    };
    let airMassFlowNameplateData: AirMassFlowNameplateData = {
      airFlow: form.controls.airFlow.value
    };
    let airMassFlowData: AirMassFlowData = {
      isNameplate: form.controls.isNameplate.value,
      airMassFlowMeasuredData: airMassFlowMeasuredData,
      airMassFlowNameplateData: airMassFlowNameplateData,
      inletTemperature: form.controls.airInletTemperature.value,
      outletTemperature: form.controls.airOutletTemperature.value,
      systemEfficiency: form.controls.airSystemEfficiency.value
    };
    let waterMassFlowData: WaterMassFlowData = {
      waterFlow: form.controls.waterFlow.value,
      inletTemperature: form.controls.waterInletTemperature.value,
      outletTemperature: form.controls.waterOutletTemperature.value,
      systemEfficiency: form.controls.waterSystemEfficiency.value
    };
    let otherMethodData: NaturalGasOtherMethodData = {
      consumption: form.controls.consumption.value
    };
    let data: NaturalGasReductionData = {
      name: form.controls.name.value,
      operatingHours: form.controls.operatingHours.value,
      fuelCost: form.controls.fuelCost.value,
      measurementMethod: form.controls.measurementMethod.value,
      flowMeterMethodData: flowMeterMethodData,
      otherMethodData: otherMethodData,
      airMassFlowData: airMassFlowData,
      waterMassFlowData: waterMassFlowData,
      units: form.controls.units.value
    };
    return data;
  }

  getResults(settings: Settings, baseline: Array<NaturalGasReductionData>, modification?: Array<NaturalGasReductionData>): NaturalGasReductionResults {
    let baselineInpCpy: Array<NaturalGasReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: NaturalGasReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: NaturalGasReductionResult = {
      energyUse: 0,
      energyCost: 0,
      heatFlow: 0,
      totalFlow: 0
    };
    if (modification) {
      let modificationInpCpy: Array<NaturalGasReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }else{
      modificationResults = baselineResults;
    }
    let naturalGasReductionResults: NaturalGasReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: 0,
      annualEnergySavings: 0
    }
    naturalGasReductionResults = this.convertResults(naturalGasReductionResults, settings);
    if (modificationResults) {
      naturalGasReductionResults.annualEnergySavings = baselineResults.energyUse - modificationResults.energyUse;
      naturalGasReductionResults.annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
    }
    return naturalGasReductionResults;
  }

  calculate(input: Array<NaturalGasReductionData>, settings: Settings): NaturalGasReductionResult {
    let inputArray: Array<NaturalGasReductionData> = this.convertInput(input, settings);
    let inputObj: NaturalGasReductionInput = {
      naturalGasReductionInputVec: inputArray
    };
    let results: NaturalGasReductionResult = this.standaloneService.naturalGasReduction(inputObj);
    // results = this.convertResults(results, settings);
    return results;
  }

  calculateIndividualEquipment(input: NaturalGasReductionData, settings: Settings): NaturalGasReductionResult {
    let inputArray: Array<NaturalGasReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInput(inputArray, settings);
    let inputObj: NaturalGasReductionInput = {
      naturalGasReductionInputVec: inputArray
    };
    let results: NaturalGasReductionResult = this.standaloneService.naturalGasReduction(inputObj);
    if (settings.unitsOfMeasure != 'Imperial') {
      results = this.convertNaturalGasReductionResult(results);
    }
    return results;
  }

  convertInput(inputArray: Array<NaturalGasReductionData>, settings: Settings): Array<NaturalGasReductionData> {
    //need loop to support conversion
    for (let i = 0; i < inputArray.length; i++) {
      let convertedFlowMeterMethodData: FlowMeterMethodData = inputArray[i].flowMeterMethodData;
      let convertedAirMassFlowMeasuredData: AirMassFlowMeasuredData = inputArray[i].airMassFlowData.airMassFlowMeasuredData;
      let convertedAirMassFlowNameplateData: AirMassFlowNameplateData = inputArray[i].airMassFlowData.airMassFlowNameplateData;
      let convertedAirMassFlowData: AirMassFlowData = inputArray[i].airMassFlowData;
      let convertedWaterMassFlowData: WaterMassFlowData = inputArray[i].waterMassFlowData;
      let convertedOtherMethodData: NaturalGasOtherMethodData = inputArray[i].otherMethodData;
      let tmp = inputArray[i];
      if (settings.unitsOfMeasure == 'Metric') {
        convertedFlowMeterMethodData = {
          flowRate: this.convertUnitsService.value(tmp.flowMeterMethodData.flowRate).from('m3/h').to('ft3/h')
        };
        convertedAirMassFlowMeasuredData = {
          areaOfDuct: this.convertUnitsService.value(tmp.airMassFlowData.airMassFlowMeasuredData.areaOfDuct).from('cm2').to('ft2'),
          airVelocity: this.convertUnitsService.value(tmp.airMassFlowData.airMassFlowMeasuredData.airVelocity).from('m').to('ft')
        };
        convertedAirMassFlowNameplateData = {
          airFlow: this.convertUnitsService.value(tmp.airMassFlowData.airMassFlowNameplateData.airFlow).from('L/s').to('ft3/min')
        };
        convertedAirMassFlowData = {
          isNameplate: tmp.airMassFlowData.isNameplate,
          airMassFlowMeasuredData: convertedAirMassFlowMeasuredData,
          airMassFlowNameplateData: convertedAirMassFlowNameplateData,
          inletTemperature: this.convertUnitsService.value(tmp.airMassFlowData.inletTemperature).from('C').to('F'),
          outletTemperature: this.convertUnitsService.value(tmp.airMassFlowData.outletTemperature).from('C').to('F'),
          systemEfficiency: tmp.airMassFlowData.systemEfficiency
        }
        convertedWaterMassFlowData = {
          waterFlow: this.convertUnitsService.value(tmp.waterMassFlowData.waterFlow).from('L/s').to('gpm'),
          inletTemperature: this.convertUnitsService.value(tmp.waterMassFlowData.inletTemperature).from('C').to('F'),
          outletTemperature: this.convertUnitsService.value(tmp.waterMassFlowData.outletTemperature).from('C').to('F'),
          systemEfficiency: convertedWaterMassFlowData.systemEfficiency
        };
        convertedOtherMethodData = {
          consumption: this.convertUnitsService.value(tmp.otherMethodData.consumption).from('GJ').to('MMBtu')
        };
        let fuelCostConversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu')
        tmp.fuelCost = tmp.fuelCost / fuelCostConversionHelper;
      }

      convertedAirMassFlowData.systemEfficiency = convertedAirMassFlowData.systemEfficiency / 100;
      convertedWaterMassFlowData.systemEfficiency = convertedWaterMassFlowData.systemEfficiency / 100;

      inputArray[i] = {
        name: tmp.name,
        operatingHours: tmp.operatingHours,
        fuelCost: tmp.fuelCost,
        measurementMethod: tmp.measurementMethod,
        flowMeterMethodData: convertedFlowMeterMethodData,
        otherMethodData: convertedOtherMethodData,
        airMassFlowData: convertedAirMassFlowData,
        waterMassFlowData: convertedWaterMassFlowData,
        units: tmp.units
      };
    }
    return inputArray;
  }

  convertResults(results: NaturalGasReductionResults, settings: Settings): NaturalGasReductionResults {
    if (settings.unitsOfMeasure == 'Metric') {
      results.baselineResults = this.convertNaturalGasReductionResult(results.baselineResults);
      if (results.modificationResults) {
        results.modificationResults = this.convertNaturalGasReductionResult(results.modificationResults);
      }
    }
    return results;
  }

  convertNaturalGasReductionResult(results: NaturalGasReductionResult) {
    return {
      energyUse: this.convertUnitsService.value(results.energyUse).from('MMBtu').to('GJ'),
      energyCost: results.energyCost,
      heatFlow: this.convertUnitsService.value(results.heatFlow).from('MMBtu').to('GJ'),
      totalFlow: this.convertUnitsService.value(results.totalFlow).from('ft3/h').to('m3/h')
    }
  }
}