import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
declare var calculatorAddon: any;

@Injectable()
export class NaturalGasReductionService {

  baselineData: Array<NaturalGasReductionData>;
  modificationData: Array<NaturalGasReductionData>;

  constructor(private fb: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  test() {
    console.log(calculatorAddon);
  }

  resetData(settings: Settings) {
    this.baselineData = new Array<NaturalGasReductionData>();
    this.modificationData = new Array<NaturalGasReductionData>();
    this.baselineData.push(this.initObject(settings));
  }

  initObject(settings?: Settings): NaturalGasReductionData {
    let defaultFlowMeterData: FlowMeterMethodData = {
      flowRate: 5
    };
    let defaultOtherData: OtherMethodData = {
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
    let obj: NaturalGasReductionData = {
      hoursPerDay: 24,
      daysPerMonth: 30,
      monthsPerYear: 12,
      fuelCost: settings && settings.fuelCost ? settings.fuelCost : 0.12,
      measurementMethod: 0,
      flowMeterMethodData: defaultFlowMeterData,
      otherMethodData: defaultOtherData,
      airMassFlowData: defaultAirMassFlowData,
      waterMassFlowData: defaultWaterMassFlowData,
      units: 1
    }
    return obj;
  }

  initForm(settings?: Settings) {
    return this.getFormFromObj(this.initObject(settings), settings);
  }

  getFormFromObj(obj: NaturalGasReductionData, settings?: Settings): FormGroup {
    // let initObj: NaturalGasReductionData = this.initObject(settings);

    let form: FormGroup = this.fb.group({
      hoursPerDay: [obj.hoursPerDay, [Validators.required, Validators.min(0), Validators.max(24)]],
      daysPerMonth: [obj.daysPerMonth, [Validators.required, Validators.min(0), Validators.max(31)]],
      monthsPerYear: [obj.monthsPerYear, [Validators.required, Validators.min(0), Validators.max(12)]],
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
    let otherMethodData: OtherMethodData = {
      consumption: form.controls.consumption.value
    };
    let data: NaturalGasReductionData = {
      hoursPerDay: form.controls.hoursPerDay.value,
      daysPerMonth: form.controls.daysPerMonth.value,
      monthsPerYear: form.controls.monthsPerYear.value,
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

  addBaselineEquipment(settings?: Settings) {
    if (this.baselineData === undefined || this.baselineData === null) {
      this.baselineData = new Array<NaturalGasReductionData>();
    }
    this.baselineData.push(this.initObject(settings ? settings : null));
  }

  removeBaselineEquipment(index: number) {
    this.baselineData.splice(index, 1);
  }

  createModification() {
    this.modificationData = new Array<NaturalGasReductionData>();
    for (let i = 0; i < this.baselineData.length; i++) {
      this.modificationData.push(this.baselineData[i]);
    }
  }

  addModificationEquipment(settings?: Settings) {
    if (this.modificationData === null || this.modificationData === undefined) {
      this.modificationData = new Array<NaturalGasReductionData>();
    }
    this.modificationData.push(this.initObject(settings ? settings : null));
  }

  removeModificationEquipment(index: number) {
    this.modificationData.splice(index, 1);
  }

  initModificationData() {
    if (this.modificationData === undefined || this.modificationData === null) {
      this.modificationData = new Array<NaturalGasReductionData>();
    }
  }

  updateBaselineDataArray(baselineForms: Array<FormGroup>): void {
    for (let i = 0; i < this.baselineData.length; i++) {
      this.baselineData[i] = this.getObjFromForm(baselineForms[i]);
    }
  }

  updateModificationDataArray(modificationForms: Array<FormGroup>): void {
    for (let i = 0; i < this.modificationData.length; i++) {
      this.modificationData[i] = this.getObjFromForm(modificationForms[i]);
    }
  }

  calculate(isBaseline: boolean, settings: Settings) {
    let tmpData = isBaseline ? this.baselineData : this.modificationData;

    //need loop to support conversion
    // for (let i = 0; i < tmpData.length; i++) {
    // }
    let inputObj: NaturalGasReductionInput = {
      naturalGasReductionInputVec: tmpData
    };
    let results: NaturalGasReductionResults = calculatorAddon.naturalGasReduction(inputObj);
    return results;
  }

  calculateIndividualEquipment(input: NaturalGasReductionData): NaturalGasReductionResults {
    let inputArray: Array<NaturalGasReductionData> = [input];
    let inputObj: NaturalGasReductionInput = {
      naturalGasReductionInputVec: inputArray
    };
    let results: NaturalGasReductionResults = calculatorAddon.naturalGasReduction(inputObj);
    return results;
  }
}

export interface NaturalGasReductionInput {
  naturalGasReductionInputVec: Array<NaturalGasReductionData>
};

export interface NaturalGasReductionData {
  hoursPerDay: number,
  daysPerMonth: number,
  monthsPerYear: number,
  fuelCost: number,
  measurementMethod: number,
  flowMeterMethodData: FlowMeterMethodData,
  otherMethodData: OtherMethodData,
  airMassFlowData: AirMassFlowData,
  waterMassFlowData: WaterMassFlowData,
  units: number
};

export interface FlowMeterMethodData {
  flowRate: number
};

export interface OtherMethodData {
  consumption: number
};

export interface AirMassFlowData {
  isNameplate: boolean,
  airMassFlowMeasuredData: AirMassFlowMeasuredData,
  airMassFlowNameplateData: AirMassFlowNameplateData,
  inletTemperature: number,
  outletTemperature: number,
  systemEfficiency: number
};

export interface AirMassFlowMeasuredData {
  areaOfDuct: number,
  airVelocity: number
};

export interface AirMassFlowNameplateData {
  airFlow: number
};

export interface WaterMassFlowData {
  waterFlow: number,
  inletTemperature: number,
  outletTemperature: number,
  systemEfficiency: number
};

export interface NaturalGasReductionResults {
  energyUse: number,
  energyCost: number,
  annualEnergySavings: number,
  costSavings: number,
  heatFlow: number,
  totalFlow: number
};