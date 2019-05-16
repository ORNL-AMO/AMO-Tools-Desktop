import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

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
    let hoursPerYear: number = 8736;
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

  getFormFromObj(obj: NaturalGasReductionData): FormGroup {
    let form: FormGroup = this.fb.group({
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

  setValidators(form: FormGroup): FormGroup {
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

  getObjFromForm(form: FormGroup): NaturalGasReductionData {
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
    let modificationResults: NaturalGasReductionResult;
    let annualEnergySavings: number = 0;
    let annualCostSavings: number = 0;
    if (modification) {
      let modificationInpCpy: Array<NaturalGasReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }
    let naturalGasReductionResults: NaturalGasReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: annualEnergySavings
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
    results = this.convertNaturalGasReductionResult(results, settings);
    return results;
  }

  convertInput(inputArray: Array<NaturalGasReductionData>, settings: Settings): Array<NaturalGasReductionData> {
    //need loop to support conversion
    for (let i = 0; i < inputArray.length; i++) {
      let tmpFlowMeterMethodData: FlowMeterMethodData = inputArray[i].flowMeterMethodData;
      let tmpAirMassFlowMeasuredData: AirMassFlowMeasuredData = inputArray[i].airMassFlowData.airMassFlowMeasuredData;
      let tmpAirMassFlowNameplateData: AirMassFlowNameplateData = inputArray[i].airMassFlowData.airMassFlowNameplateData;
      let tmpAirMassFlowData: AirMassFlowData = inputArray[i].airMassFlowData;
      let tmpWaterMassFlowData: WaterMassFlowData = inputArray[i].waterMassFlowData;
      let tmpOtherMethodData: NaturalGasOtherMethodData = inputArray[i].otherMethodData;
      let tmp = inputArray[i];
      if (settings.unitsOfMeasure == 'Metric') {
        tmpFlowMeterMethodData = {
          flowRate: this.convertUnitsService.value(tmp.flowMeterMethodData.flowRate).from('m3/h').to('ft3/h')
        };
        tmpAirMassFlowMeasuredData = {
          areaOfDuct: this.convertUnitsService.value(tmp.airMassFlowData.airMassFlowMeasuredData.areaOfDuct).from('cm2').to('ft2'),
          airVelocity: this.convertUnitsService.value(tmp.airMassFlowData.airMassFlowMeasuredData.airVelocity).from('m').to('ft')
        };
        tmpAirMassFlowNameplateData = {
          airFlow: this.convertUnitsService.value(tmp.airMassFlowData.airMassFlowNameplateData.airFlow).from('L/s').to('ft3/min')
        };
        tmpAirMassFlowData = {
          isNameplate: tmp.airMassFlowData.isNameplate,
          airMassFlowMeasuredData: tmpAirMassFlowMeasuredData,
          airMassFlowNameplateData: tmpAirMassFlowNameplateData,
          inletTemperature: this.convertUnitsService.value(tmp.airMassFlowData.inletTemperature).from('C').to('F'),
          outletTemperature: this.convertUnitsService.value(tmp.airMassFlowData.outletTemperature).from('C').to('F'),
          systemEfficiency: tmp.airMassFlowData.systemEfficiency
        }
        tmpWaterMassFlowData = {
          waterFlow: this.convertUnitsService.value(tmp.waterMassFlowData.waterFlow).from('L/s').to('gpm'),
          inletTemperature: this.convertUnitsService.value(tmp.waterMassFlowData.inletTemperature).from('C').to('F'),
          outletTemperature: this.convertUnitsService.value(tmp.waterMassFlowData.outletTemperature).from('C').to('F'),
          systemEfficiency: tmpWaterMassFlowData.systemEfficiency
        };
        tmpOtherMethodData = {
          consumption: this.convertUnitsService.value(tmp.otherMethodData.consumption).from(settings.energyResultUnit).to('MMBtu')
        };
      }

      inputArray[i] = {
        name: tmp.name,
        operatingHours: tmp.operatingHours,
        fuelCost: tmp.fuelCost,
        measurementMethod: tmp.measurementMethod,
        flowMeterMethodData: tmpFlowMeterMethodData,
        otherMethodData: tmpOtherMethodData,
        airMassFlowData: tmpAirMassFlowData,
        waterMassFlowData: tmpWaterMassFlowData,
        units: tmp.units
      };
    }
    return inputArray;
  }

  convertResults(results: NaturalGasReductionResults, settings: Settings): NaturalGasReductionResults {
    if (settings.unitsOfMeasure == 'Metric') {
      results.baselineResults = this.convertNaturalGasReductionResult(results.baselineResults, settings);
      if (results.modificationResults) {
        results.modificationResults = this.convertNaturalGasReductionResult(results.modificationResults, settings);
      }
    }
    return results;
  }

  convertNaturalGasReductionResult(results: NaturalGasReductionResult, settings: Settings) {
    return {
      energyUse: this.convertUnitsService.value(results.energyUse).from('MMBtu').to(settings.energyResultUnit),
      energyCost: results.energyCost,
      heatFlow: this.convertUnitsService.value(results.heatFlow).from('MMBtu').to(settings.energyResultUnit),
      totalFlow: this.convertUnitsService.value(results.totalFlow).from('ft3/h').to('m3/h')
    }
  }
}