import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { BehaviorSubject } from 'rxjs';
import { SteamService } from '../steam.service';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class BoilerBlowdownRateService {

  baselineInputs: BehaviorSubject<BoilerBlowdownRateInputs>;
  modificationInputs: BehaviorSubject<BoilerBlowdownRateInputs>;
  setForms: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  showBoiler: BehaviorSubject<boolean>;
  showOperations: BehaviorSubject<boolean>;
  operatingHours: BehaviorSubject<OperatingHours>;
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) {
    this.baselineInputs = new BehaviorSubject<BoilerBlowdownRateInputs>(undefined);
    this.modificationInputs = new BehaviorSubject<BoilerBlowdownRateInputs>(undefined);
    this.setForms = new BehaviorSubject<boolean>(true);
    this.currentField = new BehaviorSubject<string>('default');
    this.showBoiler = new BehaviorSubject<boolean>(false);
    this.showOperations = new BehaviorSubject<boolean>(false);
    this.operatingHours = new BehaviorSubject<OperatingHours>(undefined);
  }

  getDefaultInputs(): BoilerBlowdownRateInputs {
    return {
      steamFlow: 0,
      steamTemperature: 0,
      feedwaterConductivity: 0,
      blowdownConductivity: 0,
      makeupWaterTemperature: 0,
      fuelCost: 0,
      waterCost: 0,
      operatingHours: 0,
      boilerEfficiency: 0
    }
  }

  getExampleInputs(settings: Settings): { baseline: BoilerBlowdownRateInputs, modification: BoilerBlowdownRateInputs } {
    let steamFlow: number = this.convertUnitsService.value(1000).from('klb').to(settings.steamMassFlowMeasurement);
    steamFlow = this.convertUnitsService.roundVal(steamFlow, 0);
    let steamTemp: number = this.convertUnitsService.value(500).from('F').to(settings.steamTemperatureMeasurement);
    steamTemp = this.convertUnitsService.roundVal(steamTemp, 0);
    let makeupWaterTemp: number = this.convertUnitsService.value(50).from('F').to(settings.steamTemperatureMeasurement);
    makeupWaterTemp = this.convertUnitsService.roundVal(makeupWaterTemp, 0);
    let fuelCostConversionHelper: number = this.convertUnitsService.value(1).from('MMBtu').to(settings.steamEnergyMeasurement);
    let convertedFuelCost: number = 4.99 / fuelCostConversionHelper;
    // convertedFuelCost = this.convertUnitsService.roundVal(convertedFuelCost, 4);
    let makeupWaterConversionHelper: number = this.convertUnitsService.value(1).from('gal').to(settings.steamVolumeMeasurement);
    let convertedMakupeWaterCost: number = .0025 / makeupWaterConversionHelper;
    // convertedMakupeWaterCost = this.convertUnitsService.roundVal(convertedMakupeWaterCost, 4);
    let baselineInputs: BoilerBlowdownRateInputs = {
      steamFlow: steamFlow,
      steamTemperature: steamTemp,
      feedwaterConductivity: 400,
      blowdownConductivity: 5500,
      makeupWaterTemperature: makeupWaterTemp,
      fuelCost: convertedFuelCost,
      waterCost: convertedMakupeWaterCost,
      operatingHours: 8760,
      boilerEfficiency: 85
    }
    let modificationInputs: BoilerBlowdownRateInputs = JSON.parse(JSON.stringify(baselineInputs));
    modificationInputs.blowdownConductivity = 6000;
    modificationInputs.feedwaterConductivity = 200;
    return { baseline: baselineInputs, modification: modificationInputs };
  }

  getConductivityFormFromObj(obj: BoilerBlowdownRateInputs): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      feedwaterConductivity: [obj.feedwaterConductivity, [Validators.required, Validators.min(0), Validators.max(9000)]],
      blowdownConductivity: [obj.blowdownConductivity, [Validators.required, Validators.min(0), Validators.max(9000)]],
    });
    return form;
  }

  getBoilerFormFromObj(obj: BoilerBlowdownRateInputs, settings: Settings): UntypedFormGroup {
    let ranges: BoilerBlowdownRateRanges = this.getRanges(settings);
    let form: UntypedFormGroup = this.formBuilder.group({
      steamFlow: [obj.steamFlow, [Validators.required, Validators.min(0), Validators.max(ranges.steamFlowMax)]],
      steamTemperature: [obj.steamTemperature, [Validators.required, Validators.min(ranges.steamTempMin), Validators.max(ranges.steamTempMax)]],
      boilerEfficiency: [obj.boilerEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]]
    });
    return form;
  }

  getOperationsFormFromObj(obj: BoilerBlowdownRateInputs, settings: Settings): UntypedFormGroup {
    let ranges: BoilerBlowdownRateRanges = this.getRanges(settings);
    let form: UntypedFormGroup = this.formBuilder.group({
      blowdownConductivity: [obj.blowdownConductivity, [Validators.required, Validators.required, Validators.min(0), Validators.max(9000)]],
      makeupWaterTemperature: [obj.makeupWaterTemperature, [Validators.required, Validators.min(ranges.makeupWaterMin), Validators.max(ranges.makeupWaterMax)]],
      fuelCost: [obj.fuelCost, [Validators.required, Validators.min(0)]],
      waterCost: [obj.waterCost, [Validators.required, Validators.min(0)]],
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]]
    });
    return form;
  }

  updateObjFromConductivityForm(form: UntypedFormGroup, obj: BoilerBlowdownRateInputs): BoilerBlowdownRateInputs {
    obj.feedwaterConductivity = form.controls.feedwaterConductivity.value;
    obj.blowdownConductivity = form.controls.blowdownConductivity.value;
    return obj;
  }

  updateObjFromBoilerForm(form: UntypedFormGroup, obj: BoilerBlowdownRateInputs): BoilerBlowdownRateInputs {
    obj.steamFlow = form.controls.steamFlow.value;
    obj.steamTemperature = form.controls.steamTemperature.value;
    obj.boilerEfficiency = form.controls.boilerEfficiency.value;
    return obj;
  }

  updateObjFromOperationsForm(form: UntypedFormGroup, obj: BoilerBlowdownRateInputs): BoilerBlowdownRateInputs {
    obj.makeupWaterTemperature = form.controls.makeupWaterTemperature.value;
    obj.fuelCost = form.controls.fuelCost.value;
    obj.waterCost = form.controls.waterCost.value;
    obj.operatingHours = form.controls.operatingHours.value;
    return obj;
  }


  getRanges(settings: Settings): BoilerBlowdownRateRanges {
    let steamFlowMax: number = this.convertUnitsService.value(100000).from('klb').to(settings.steamMassFlowMeasurement);
    steamFlowMax = this.convertUnitsService.roundVal(steamFlowMax, 0);
    let steamTempMax: number = this.convertUnitsService.value(1073.15).from('K').to(settings.steamTemperatureMeasurement);
    steamTempMax = this.convertUnitsService.roundVal(steamTempMax, 0);
    let steamTempMin: number = this.convertUnitsService.value(273.15).from('K').to(settings.steamTemperatureMeasurement);
    steamTempMin = this.convertUnitsService.roundVal(steamTempMin, 0);
    let makeupWaterMin: number = this.convertUnitsService.value(277.6).from('K').to(settings.steamTemperatureMeasurement);
    makeupWaterMin = this.convertUnitsService.roundVal(makeupWaterMin, 0);
    let makeupWaterMax: number = this.convertUnitsService.value(344.3).from('K').to(settings.steamTemperatureMeasurement);
    makeupWaterMax = this.convertUnitsService.roundVal(makeupWaterMax, 0);
    return {
      steamFlowMax: steamFlowMax,
      steamTempMax: steamTempMax,
      steamTempMin: steamTempMin,
      makeupWaterMin: makeupWaterMin,
      makeupWaterMax: makeupWaterMax
    }
  }


  //calculations
  calculateResults(inputs: BoilerBlowdownRateInputs, settings: Settings, calcBoilerVals: boolean, calcCostVals: boolean): BoilerBlowdownRateResults {
    //always
    let blowdownRate: number = this.calculateBlowdownRate(inputs.feedwaterConductivity, inputs.blowdownConductivity);
    let feedwaterFlowRate: number
    let blowdownFlowRate: number = 0;
    let blowdownEnthalpy: number = 0;
    let makeupWaterProperties: { enthalpy: number, specificVolume: number } = { enthalpy: 0, specificVolume: 0 };
    let boilerFuelCost: number = 0;
    let makeupWaterCost: number = 0;
    //boiler
    if (calcBoilerVals == true) {
      feedwaterFlowRate = this.calculateFeedwaterFlowRate(blowdownRate, inputs);
      blowdownFlowRate = this.calculateBlowdownFlowRate(blowdownRate, inputs);
      blowdownEnthalpy = this.calculateBlowdownEnthalpy(inputs.steamTemperature, settings);
    }
    //costs
    if (calcCostVals == true) {
      makeupWaterProperties = this.calculateMakeupWaterProperties(inputs.makeupWaterTemperature, settings);
      boilerFuelCost = this.calculateBoilerFuelCost(blowdownRate, blowdownEnthalpy, makeupWaterProperties.enthalpy, inputs, settings);
      makeupWaterCost = this.calculateWaterCost(inputs, blowdownRate, makeupWaterProperties.specificVolume, settings);
    }// blowdownRate = this.convertUnitsService.roundVal(blowdownRate, 3) * 100;
    return {
      blowdownRate: blowdownRate * 100,
      boilerFuelCost: boilerFuelCost,
      makeupWaterCost: makeupWaterCost,
      totalCost: boilerFuelCost + makeupWaterCost,
      feedwaterFlowRate: feedwaterFlowRate,
      blowdownFlowRate: blowdownFlowRate
    }
  }

  calculateBlowdownRate(feedwaterConductivity: number, blowdownConductivity: number): number {
    return feedwaterConductivity / (blowdownConductivity - feedwaterConductivity);;
  }

  calculateBlowdownEnthalpy(steamTemp: number, settings: Settings): number {
    return this.steamService.saturatedProperties({ saturatedTemperature: steamTemp }, 1, settings).liquidEnthalpy;
  }

  calculateFeedwaterFlowRate(blowdownRate: number, inputs: BoilerBlowdownRateInputs): number {
    return (inputs.steamFlow / (1 - blowdownRate));
  }

  calculateBlowdownFlowRate(blowdownRate: number, inputs: BoilerBlowdownRateInputs): number {
    return ((inputs.steamFlow * blowdownRate) / (1 - blowdownRate));
  }


  calculateMakeupWaterProperties(makeupWaterTemp: number, settings: Settings): { enthalpy: number, specificVolume: number } {
    let properties: SteamPropertiesOutput = this.steamService.steamProperties({
      thermodynamicQuantity: 0,
      pressure: .101325,
      quantityValue: makeupWaterTemp
    }, settings);
    return { enthalpy: properties.specificEnthalpy, specificVolume: properties.specificVolume };
  }

  calculateBoilerFuelCost(blowdownRate: number, blowdownEnthalpy: number, makeupWaterEnthalpy: number, inputs: BoilerBlowdownRateInputs, settings: Settings): number {
    //steam flow klb/hr
    let convertedSteamFlow: number = this.convertUnitsService.value(inputs.steamFlow).from(settings.steamMassFlowMeasurement).to('klb');
    // enthalpy btu/lb
    let convertedBlowdownEnthalpy: number = this.convertUnitsService.value(blowdownEnthalpy).from(settings.steamSpecificEnthalpyMeasurement).to('btuLb');
    let convertedMakeupWaterEnthalpy: number = this.convertUnitsService.value(makeupWaterEnthalpy).from(settings.steamSpecificEnthalpyMeasurement).to('btuLb');
    // fuel cost $/mmbtu
    let conversionHelper: number = this.convertUnitsService.value(1).from(settings.steamEnergyMeasurement).to('MMBtu');
    let convertedFuelCost: number = inputs.fuelCost / conversionHelper;
    return blowdownRate * convertedSteamFlow * (convertedBlowdownEnthalpy - convertedMakeupWaterEnthalpy) * inputs.operatingHours * convertedFuelCost / (1000 * (inputs.boilerEfficiency / 100));
  }

  calculateWaterCost(inputs: BoilerBlowdownRateInputs, blowdownRate: number, makeupWaterSpecificVolume: number, settings: Settings): number {
    //steam flow klb/hr
    let convertedSteamFlow: number = this.convertUnitsService.value(inputs.steamFlow).from(settings.steamMassFlowMeasurement).to('klb');
    //water cost $/gal
    let conversionHelper: number = this.convertUnitsService.value(1).from(settings.steamVolumeMeasurement).to('gal');
    let convertedMakupeWaterCost: number = inputs.waterCost / conversionHelper;
    //specific volume gal/lb
    let convertedMakeupWaterSpecificVolume: number = this.convertUnitsService.value(makeupWaterSpecificVolume).from(settings.steamSpecificVolumeMeasurement).to('gallb');
    return ((convertedSteamFlow * blowdownRate) / (1 - blowdownRate)) * inputs.operatingHours * convertedMakupeWaterCost * convertedMakeupWaterSpecificVolume * 1000;
  }
}

export interface BoilerBlowdownRateInputs {
  steamFlow: number,
  steamTemperature: number,
  feedwaterConductivity: number,
  blowdownConductivity: number,
  makeupWaterTemperature: number,
  fuelCost: number,
  waterCost: number,
  operatingHours: number,
  boilerEfficiency: number
}


export interface BoilerBlowdownRateRanges {
  steamFlowMax: number;
  steamTempMax: number;
  steamTempMin: number;
  makeupWaterMin: number;
  makeupWaterMax: number;
}

export interface BoilerBlowdownRateResults {
  blowdownRate: number;
  boilerFuelCost: number;
  makeupWaterCost: number;
  totalCost: number;
  blowdownFlowRate: number;
  feedwaterFlowRate: number;
}