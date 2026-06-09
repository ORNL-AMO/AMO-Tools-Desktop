import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import {
  CompressedAirReductionData,
  CompressedAirFlowMeterMethodData,
  PressureMethodData,
  CompressedAirOtherMethodData,
  CompressorElectricityData,
  CompressedAirReductionResults,
  CompressedAirReductionInput,
  CompressedAirReductionResult,
  BagMethodInput
} from '../../../shared/models/standalone';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertCompressedAirReductionService } from './convert-compressed-air-reduction.service';
import { getNewIdString } from '../../../shared/helperFunctions';

// Typed form group exported so form components can reference it without duplicating the type
export type CompressedAirReductionForm = FormGroup<{
  name: FormControl<string>;
  hoursPerYear: FormControl<number>;
  // utilityType is only editable on the first baseline item; all others disable it
  utilityType: FormControl<number>;
  measurementMethod: FormControl<number>;
  // flow meter method
  meterReading: FormControl<number>;
  // bag method
  bagVolume: FormControl<number>;
  bagFillTime: FormControl<number>;
  operatingTime: FormControl<number>;
  // orifice/pressure method
  nozzleType: FormControl<number>;
  supplyPressure: FormControl<number>;
  numberOfNozzles: FormControl<number>;
  // offsheet/other method
  consumption: FormControl<number>;
  // compressor electricity (electricity utility type only)
  compressedAirCost: FormControl<number>;
  electricityCost: FormControl<number>;
  compressorControl: FormControl<number>;
  compressorControlAdjustment: FormControl<number>;
  compressorSpecificPowerControl: FormControl<number>;
  compressorSpecificPower: FormControl<number>;
  units: FormControl<number>;
}>;

@Injectable()
export class CompressedAirReductionService {

  // All mutable state lives in BehaviorSubjects so components can use toSignal() for reactive reads
  baselineData: BehaviorSubject<Array<CompressedAirReductionData>> = new BehaviorSubject<Array<CompressedAirReductionData>>([]);
  modificationData: BehaviorSubject<Array<CompressedAirReductionData>> = new BehaviorSubject<Array<CompressedAirReductionData>>([]);
  focusedPanel: BehaviorSubject<'baseline' | 'modification'> = new BehaviorSubject<'baseline' | 'modification'>('baseline');
  results: BehaviorSubject<CompressedAirReductionResults> = new BehaviorSubject<CompressedAirReductionResults>(null);
  focusedField: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  operatingHours: OperatingHours;

  private formBuilder = inject(FormBuilder);
  private standaloneService = inject(StandaloneService);
  private convertCompressedAirReductionService = inject(ConvertCompressedAirReductionService);

  initObject(index: number, settings: Settings, operatingHours: OperatingHours, utilityType?: number): CompressedAirReductionData {
    const defaultFlowMeterObj: CompressedAirFlowMeterMethodData = { meterReading: 0.2 };
    const defaultBagMethodObj: BagMethodInput = { bagVolume: 3.92, operatingTime: 0, bagFillTime: 80 };
    const defaultPressureMethodObj: PressureMethodData = { nozzleType: 0, numberOfNozzles: 3, supplyPressure: 80 };
    const defaultOtherMethodObj: CompressedAirOtherMethodData = { consumption: 1750 };
    const defaultCompressorElectricityObj: CompressorElectricityData = {
      compressorControl: 8,
      compressorControlAdjustment: 25,
      compressorSpecificPowerControl: 0,
      compressorSpecificPower: 16
    };

    const hoursPerYear = operatingHours ? operatingHours.hoursPerYear : 8760;
    const resolvedUtilityType = utilityType ?? 0;
    let utilityCost = settings?.electricityCost ?? 0.066;
    if (resolvedUtilityType === 0) {
      utilityCost = settings?.compressedAirCost ?? 0.12;
    }

    let obj: CompressedAirReductionData = {
      name: 'Equipment #' + (index + 1),
      hoursPerYear,
      utilityType: resolvedUtilityType,
      utilityCost,
      compressedAirCost: settings?.compressedAirCost ?? 0.12,
      electricityCost: settings?.electricityCost ?? 0.066,
      measurementMethod: 0,
      flowMeterMethodData: defaultFlowMeterObj,
      bagMethodData: defaultBagMethodObj,
      pressureMethodData: defaultPressureMethodObj,
      otherMethodData: defaultOtherMethodObj,
      compressorElectricityData: defaultCompressorElectricityObj,
      units: 1,
      guid: getNewIdString()
    };

    if (settings.unitsOfMeasure !== 'Imperial') {
      obj = this.convertCompressedAirReductionService.convertDefaultData(obj);
    }
    return obj;
  }

  generateExample(settings: Settings, isBaseline: boolean): CompressedAirReductionData {
    const meterReading = isBaseline ? 0.2 : 0.1;
    let defaultData: CompressedAirReductionData = {
      name: 'Equipment #1',
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: settings?.compressedAirCost ?? 0.12,
      compressedAirCost: settings?.compressedAirCost ?? 0.12,
      electricityCost: settings?.electricityCost ?? 0.066,
      measurementMethod: 0,
      flowMeterMethodData: { meterReading },
      bagMethodData: { operatingTime: 0, bagVolume: 0, bagFillTime: 0 },
      pressureMethodData: { nozzleType: 0, numberOfNozzles: 0, supplyPressure: 0 },
      otherMethodData: { consumption: 0 },
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      },
      units: 1,
      guid: getNewIdString()
    };

    if (settings.unitsOfMeasure !== 'Imperial') {
      defaultData = this.convertCompressedAirReductionService.convertDefaultData(defaultData);
    }
    return defaultData;
  }

  getFormFromObj(inputObj: CompressedAirReductionData, index: number, isBaseline: boolean): CompressedAirReductionForm {
    // utilityType is only editable on the first baseline item to keep all equipment in sync
    const utilityTypeDisabled = index !== 0 || !isBaseline;
    const form = this.formBuilder.nonNullable.group({
      name: [inputObj.name, [Validators.required]],
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [{ value: inputObj.utilityType, disabled: utilityTypeDisabled }],
      measurementMethod: [inputObj.measurementMethod, [Validators.required]],
      // flow meter
      meterReading: [inputObj.flowMeterMethodData.meterReading],
      // bag method
      bagVolume: [inputObj.bagMethodData.bagVolume],
      bagFillTime: [inputObj.bagMethodData.bagFillTime],
      operatingTime: [inputObj.bagMethodData.operatingTime],
      // pressure method
      nozzleType: [inputObj.pressureMethodData.nozzleType],
      supplyPressure: [inputObj.pressureMethodData.supplyPressure],
      numberOfNozzles: [inputObj.pressureMethodData.numberOfNozzles],
      // other method
      consumption: [inputObj.otherMethodData.consumption],
      // costs
      compressedAirCost: [inputObj.compressedAirCost],
      electricityCost: [inputObj.electricityCost],
      // compressor electricity fields (disabled on modification so baseline values are used in calculation)
      compressorControl: [{ value: inputObj.compressorElectricityData.compressorControl, disabled: !isBaseline }],
      compressorControlAdjustment: [{ value: inputObj.compressorElectricityData.compressorControlAdjustment, disabled: !isBaseline }],
      compressorSpecificPowerControl: [{ value: inputObj.compressorElectricityData.compressorSpecificPowerControl, disabled: !isBaseline }],
      compressorSpecificPower: [inputObj.compressorElectricityData.compressorSpecificPower],
      units: [inputObj.units]
    }) as CompressedAirReductionForm;

    return this.setValidators(form);
  }

  // Validators depend on the active measurement method and utility type, so they are rebuilt
  // whenever those values change (called from the form component on change events).
  setValidators(form: CompressedAirReductionForm): CompressedAirReductionForm {
    // Reset method-specific validators before applying the active set
    form.controls.meterReading.clearValidators();
    form.controls.bagVolume.clearValidators();
    form.controls.bagFillTime.clearValidators();
    form.controls.nozzleType.clearValidators();
    form.controls.supplyPressure.clearValidators();
    form.controls.numberOfNozzles.clearValidators();
    form.controls.consumption.clearValidators();
    form.controls.units.clearValidators();
    form.controls.compressedAirCost.clearValidators();
    form.controls.electricityCost.clearValidators();
    form.controls.compressorControl.clearValidators();
    form.controls.compressorControlAdjustment.clearValidators();
    form.controls.compressorSpecificPower.clearValidators();

    form.controls.units.setValidators([Validators.required, Validators.min(0)]);

    switch (form.controls.measurementMethod.value) {
      case 0: // flow meter
        form.controls.meterReading.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 1: // bag method
        form.controls.bagVolume.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
        form.controls.bagFillTime.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
        break;
      case 2: // orifice/pressure
        form.controls.nozzleType.setValidators([Validators.required]);
        form.controls.supplyPressure.setValidators([Validators.required, Validators.min(0)]);
        form.controls.numberOfNozzles.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 3: // offsheet/other — no units needed
        form.controls.consumption.setValidators([Validators.required, Validators.min(0)]);
        form.controls.units.clearValidators();
        break;
    }

    const utilityType = form.controls.utilityType.value;
    if (utilityType === 0) {
      form.controls.compressedAirCost.setValidators([Validators.required, Validators.min(0)]);
    } else if (utilityType === 1) {
      form.controls.electricityCost.setValidators([Validators.required, Validators.min(0)]);
      form.controls.compressorControl.setValidators([Validators.required]);
      if (form.controls.compressorControl.value === 8) {
        form.controls.compressorControlAdjustment.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      }
      if (form.controls.compressorSpecificPowerControl.value === 4) {
        form.controls.compressorSpecificPower.setValidators([Validators.required, Validators.min(0)]);
      }
    }

    form.updateValueAndValidity();
    return form;
  }

  updateObjectFromForm(form: CompressedAirReductionForm, obj: CompressedAirReductionData): CompressedAirReductionData {
    obj.name = form.controls.name.value;
    obj.hoursPerYear = form.controls.hoursPerYear.value;
    // getRawValue() is used so disabled controls (utilityType on non-first items) are included
    obj.utilityType = form.getRawValue().utilityType;
    obj.compressedAirCost = form.controls.compressedAirCost.value;
    obj.electricityCost = form.controls.electricityCost.value;
    obj.utilityCost = obj.utilityType === 0 ? obj.compressedAirCost : obj.electricityCost;
    obj.measurementMethod = form.controls.measurementMethod.value;
    obj.flowMeterMethodData = { meterReading: form.controls.meterReading.value };
    obj.bagMethodData = {
      bagVolume: form.controls.bagVolume.value,
      bagFillTime: form.controls.bagFillTime.value,
      operatingTime: form.controls.hoursPerYear.value
    };
    obj.pressureMethodData = {
      nozzleType: form.controls.nozzleType.value,
      numberOfNozzles: form.controls.numberOfNozzles.value,
      supplyPressure: form.controls.supplyPressure.value
    };
    obj.otherMethodData = { consumption: form.controls.consumption.value };
    // getRawValue() on sub-fields so disabled compressor controls are included
    obj.compressorElectricityData = {
      compressorControl: form.getRawValue().compressorControl,
      compressorControlAdjustment: form.getRawValue().compressorControlAdjustment,
      compressorSpecificPowerControl: form.getRawValue().compressorSpecificPowerControl,
      compressorSpecificPower: form.controls.compressorSpecificPower.value
    };
    obj.units = form.controls.units.value;
    return obj;
  }

  getResults(settings: Settings, baseline: Array<CompressedAirReductionData>, modification?: Array<CompressedAirReductionData>): CompressedAirReductionResults {
    const results: CompressedAirReductionResults = {
      baselineResults: [],
      modificationResults: [],
      baselineAggregateResults: undefined,
      modificationAggregateResults: undefined,
      annualCostSavings: 0,
      annualEnergySavings: 0,
      annualFlowRateReduction: 0,
      annualConsumptionReduction: 0
    };

    // Deep-copy inputs so unit conversion does not mutate the original objects
    const baselineInpCpy: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(baseline));
    results.baselineAggregateResults = this.calculate(baselineInpCpy, settings);

    let modificationInpCpy: Array<CompressedAirReductionData> | undefined;
    if (modification && modification.length > 0) {
      modificationInpCpy = JSON.parse(JSON.stringify(modification));
      // Modification uses baseline compressor electricity values (control type and specific power)
      // so energy savings reflect only the flow-rate changes, not compressor changes
      modificationInpCpy.forEach((modInput, index) => {
        if (baselineInpCpy[index]) {
          modInput.compressorElectricityData.compressorControlAdjustment = baselineInpCpy[index].compressorElectricityData.compressorControlAdjustment;
          modInput.compressorElectricityData.compressorSpecificPower = baselineInpCpy[index].compressorElectricityData.compressorSpecificPower;
        }
      });
      results.modificationAggregateResults = this.calculate(modificationInpCpy, settings);
    } else {
      results.modificationAggregateResults = results.baselineAggregateResults;
    }

    this.buildIndividualResults(baselineInpCpy, modificationInpCpy, results, settings);

    // For compressed-air utility type, consumption IS the energy use metric
    if (baselineInpCpy.length > 0 && baselineInpCpy[0].utilityType === 0) {
      results.baselineAggregateResults.energyUse = results.baselineAggregateResults.consumption;
      results.modificationAggregateResults.energyUse = results.modificationAggregateResults.consumption;
    }

    results.annualCostSavings = results.baselineAggregateResults.energyCost - results.modificationAggregateResults.energyCost;
    results.annualFlowRateReduction = results.baselineAggregateResults.flowRate - results.modificationAggregateResults.flowRate;
    results.annualConsumptionReduction = results.baselineAggregateResults.consumption - results.modificationAggregateResults.consumption;
    return results;
  }

  private buildIndividualResults(
    baselineInpCpy: Array<CompressedAirReductionData>,
    modificationInpCpy: Array<CompressedAirReductionData> | undefined,
    results: CompressedAirReductionResults,
    settings: Settings
  ): void {
    baselineInpCpy.forEach((input, index) => {
      let baselineResult: CompressedAirReductionResult = this.calculateIndividualEquipment(input, settings);
      let modResult: CompressedAirReductionResult;

      if (modificationInpCpy?.[index]) {
        modResult = this.calculateIndividualEquipment(modificationInpCpy[index], settings);
      } else {
        modResult = baselineResult;
      }

      // Same energy-use mapping as aggregate for compressed-air utility type
      if (input.utilityType === 0) {
        baselineResult.energyUse = baselineResult.consumption;
        modResult.energyUse = modResult.consumption;
      }

      results.annualEnergySavings += baselineResult.energyUse - modResult.energyUse;
      results.baselineResults.push(baselineResult);
      results.modificationResults.push(modResult);
    });
  }

  private calculate(input: Array<CompressedAirReductionData>, settings: Settings): CompressedAirReductionResult {
    const inputCopy: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(input));
    const inputArray = this.convertCompressedAirReductionService.convertInputs(inputCopy, settings);
    const inputObj: CompressedAirReductionInput = { compressedAirReductionInputVec: inputArray };
    let result = this.standaloneService.compressedAirReduction(inputObj);
    return this.convertCompressedAirReductionService.convertResults(result, settings);
  }

  private calculateIndividualEquipment(input: CompressedAirReductionData, settings: Settings): CompressedAirReductionResult {
    const inputArray = this.convertCompressedAirReductionService.convertInputs(
      JSON.parse(JSON.stringify([input])),
      settings
    );
    const inputObj: CompressedAirReductionInput = { compressedAirReductionInputVec: inputArray };
    let result = this.standaloneService.compressedAirReduction(inputObj);
    return this.convertCompressedAirReductionService.convertResults(result, settings);
  }
}
