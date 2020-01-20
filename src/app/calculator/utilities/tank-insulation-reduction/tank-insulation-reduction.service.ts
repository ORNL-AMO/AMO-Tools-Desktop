import { Injectable } from '@angular/core';
import { OperatingHours } from '../../../shared/models/operations';
import { TankInsulationReductionInput, TankInsulationReductionResult, TankInsulationReductionResults } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StandaloneService } from '../../standalone.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable({
  providedIn: 'root'
})
export class TankInsulationReductionService {

  baselineData: TankInsulationReductionInput;
  modificationData: TankInsulationReductionInput;
  operatingHours: OperatingHours;

  constructor(private fb: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  initObject(settings: Settings, operatingHours: OperatingHours): TankInsulationReductionInput {
    let hoursPerYear = 8760;
    if (operatingHours && operatingHours.hoursPerYear !== undefined && operatingHours.hoursPerYear !== null) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let obj: TankInsulationReductionInput = {
      operatingHours: hoursPerYear,
      utilityType: 0,
      utilityCost: settings.fuelCost,
      naturalGasUtilityCost: settings.fuelCost,
      otherUtilityCost: settings.otherFuelCost,
      tankHeight: 0,
      tankDiameter: 0,
      tankThickness: 0,
      tankEmissivity: this.getTankMaterialData(0).emissivity,
      tankConductivity: this.getTankMaterialData(0).conductivity,
      tankTemperature: 0,
      ambientTemperature: 0,
      systemEfficiency: 0,
      insulationThickness: 0,
      insulationConductivity: this.getInsulationConductivity(0),
      customInsulationConductivity: 0,
      jacketEmissivity: 0.9,
      tankMaterialSelection: 0,
      insulationMaterialSelection: 0,
      jacketMaterialSelection: 0
    };
    return obj;
  }

  getFormFromObj(obj: TankInsulationReductionInput, isBaseline: boolean): FormGroup {
    let form: FormGroup = this.fb.group({
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [{ value: obj.utilityType, disabled: !isBaseline }],
      utilityCost: [{ value: obj.utilityCost, disabled: !isBaseline }, [Validators.required, Validators.min(0)]],
      systemEfficiency: [obj.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      tankHeight: [obj.tankHeight, [Validators.required, Validators.min(0)]],
      tankDiameter: [obj.tankDiameter, [Validators.required, Validators.min(0)]],
      tankThickness: [obj.tankThickness, [Validators.required, Validators.min(0)]],
      tankEmissivity: [obj.tankEmissivity, [Validators.required, Validators.min(0), Validators.max(1)]],
      tankConductivity: [obj.tankConductivity, [Validators.required, Validators.min(0)]],
      tankTemperature: [obj.tankTemperature, [Validators.required]],
      ambientTemperature: [obj.ambientTemperature, [Validators.required]],
      insulationThickness: [obj.insulationThickness, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      tankMaterialSelection: [obj.tankMaterialSelection],
      insulationMaterialSelection: [obj.insulationMaterialSelection],
      customInsulationConductivity: [obj.customInsulationConductivity],
      jacketMaterialSelection: [obj.jacketMaterialSelection]
    });

    if (obj.insulationMaterialSelection != 0) {
      form.controls.insulationThickness.setValidators([Validators.required, Validators.min(0), Validators.max(1000000)]);
      if (obj.insulationMaterialSelection == 1) {
        form.controls.customInsulationConductivity.setValidators([Validators.required, Validators.min(0)]);
      } else {
        form.controls.customInsulationConductivity.clearValidators();
      }
    } else if (obj.insulationMaterialSelection == 0) {
      form.controls.insulationThickness.clearValidators();
      form.controls.customInsulationConductivity.clearValidators();
      form.controls.jacketMaterialSelection.disable();
    }

    return form;
  }

  getObjFromForm(form: FormGroup, data: TankInsulationReductionInput, settings: Settings): TankInsulationReductionInput {
    let naturalGasUtilityCost = data.naturalGasUtilityCost;
    let otherUtilityCost = data.otherUtilityCost;
    if (form.controls.utilityType.value == 0) {
      naturalGasUtilityCost = form.controls.utilityCost.value;
    } else if (form.controls.utilityType.value == 1) {
      otherUtilityCost = form.controls.utilityCost.value;
    }
    let insulationThickness: number;
    if (form.controls.insulationMaterialSelection.value == 0) {
      insulationThickness = 0;
    } else {
      insulationThickness = form.controls.insulationThickness.value;
    }
    let obj: TankInsulationReductionInput = {
      operatingHours: form.controls.operatingHours.value,
      utilityType: form.controls.utilityType.value,
      utilityCost: form.controls.utilityCost.value,
      naturalGasUtilityCost: naturalGasUtilityCost,
      otherUtilityCost: otherUtilityCost,
      tankHeight: form.controls.tankHeight.value,
      tankDiameter: form.controls.tankDiameter.value,
      tankThickness: form.controls.tankThickness.value,
      tankEmissivity: this.getTankMaterialData(form.controls.tankMaterialSelection.value).emissivity,
      tankConductivity: this.getTankMaterialData(form.controls.tankMaterialSelection.value).conductivity,
      tankTemperature: form.controls.tankTemperature.value,
      ambientTemperature: form.controls.ambientTemperature.value,
      systemEfficiency: form.controls.systemEfficiency.value,
      insulationThickness: insulationThickness,
      insulationConductivity: this.getInsulationConductivity(form.controls.insulationMaterialSelection.value),
      customInsulationConductivity: form.controls.customInsulationConductivity.value,
      jacketEmissivity: this.getJacketEmissivity(form.controls.jacketMaterialSelection.value),
      tankMaterialSelection: form.controls.tankMaterialSelection.value,
      insulationMaterialSelection: form.controls.insulationMaterialSelection.value,
      jacketMaterialSelection: form.controls.jacketMaterialSelection.value
    };
    if (obj.insulationMaterialSelection == 1) {
      if (settings.unitsOfMeasure != 'Imperial') {
        obj.insulationConductivity = this.convertUnitsService.value(obj.customInsulationConductivity).from('W/mK').to('Btu/hr-ft-R');
      } else {
        obj.insulationConductivity = obj.customInsulationConductivity;
      }
    }
    return obj;
  }

  generateExample(settings: Settings, isBaseline: boolean): TankInsulationReductionInput {
    let example: TankInsulationReductionInput;
    if (isBaseline) {
      example = {
        operatingHours: 8760,
        utilityType: 0,
        utilityCost: settings.fuelCost,
        naturalGasUtilityCost: settings.fuelCost,
        otherUtilityCost: settings.otherFuelCost,
        tankHeight: 50,
        tankDiameter: 1.0,
        tankThickness: 0.25,
        tankEmissivity: this.getTankMaterialData(6).emissivity,
        tankConductivity: this.getTankMaterialData(6).conductivity,
        tankTemperature: 300,
        ambientTemperature: 80,
        systemEfficiency: 90,
        insulationThickness: 0,
        insulationConductivity: this.getInsulationConductivity(0),
        customInsulationConductivity: 0,
        jacketEmissivity: this.getJacketEmissivity(0),
        tankMaterialSelection: 6,
        insulationMaterialSelection: 0,
        jacketMaterialSelection: 0
      };
    } else {
      example = {
        operatingHours: 8760,
        utilityType: 0,
        utilityCost: settings.fuelCost,
        naturalGasUtilityCost: settings.fuelCost,
        otherUtilityCost: settings.otherFuelCost,
        tankHeight: 50,
        tankDiameter: 1.0,
        tankThickness: 0.25,
        tankEmissivity: this.getTankMaterialData(6).emissivity,
        tankConductivity: this.getTankMaterialData(6).conductivity,
        tankTemperature: 300,
        ambientTemperature: 80,
        systemEfficiency: 90,
        insulationThickness: 3,
        insulationConductivity: this.getInsulationConductivity(22),
        customInsulationConductivity: 0,
        jacketEmissivity: this.getJacketEmissivity(8),
        tankMaterialSelection: 6,
        insulationMaterialSelection: 22,
        jacketMaterialSelection: 8
      };
    }
    return example;
  }

  getResults(settings: Settings, baseline: TankInsulationReductionInput, modification?: TankInsulationReductionInput) {
    let baselineCopy: TankInsulationReductionInput = JSON.parse(JSON.stringify(baseline));
    let baselineResults: TankInsulationReductionResult = this.calculate(baselineCopy, settings);
    let modificationResults: TankInsulationReductionResult;
    let annualHeatLossReduction: number = 0;
    let annualCostSavings: number = 0;
    if (modification) {
      let modificationCopy: TankInsulationReductionInput = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationCopy, settings);
      annualHeatLossReduction = baselineResults.annualHeatLoss - modificationResults.annualHeatLoss;
      annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
    }
    let tankInsulationReductionResults: TankInsulationReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualHeatSavings: annualHeatLossReduction,
      annualCostSavings: annualCostSavings
    };
    return tankInsulationReductionResults;
  }

  calculate(input: TankInsulationReductionInput, settings: Settings): TankInsulationReductionResult {
    let convertedInput: TankInsulationReductionInput = this.convertInputs(input, settings);
    let results: TankInsulationReductionResult = this.standaloneService.tankInsulationReduction(convertedInput);
    results = this.convertResults(results, settings);
    if (settings.unitsOfMeasure != 'Imperial') {
      results.energyCost = results.annualHeatLoss * input.utilityCost / 1000;
    } else {
      results.energyCost = results.annualHeatLoss * input.utilityCost;
    }
    return results;
  }

  convertInputs(input: TankInsulationReductionInput, settings: Settings): TankInsulationReductionInput {
    let convertedInput: TankInsulationReductionInput = input;
    if (settings.unitsOfMeasure == 'Imperial') {
      convertedInput.tankTemperature = convertedInput.tankTemperature + 459.67;
      convertedInput.ambientTemperature = convertedInput.ambientTemperature + 459.67;
    } else {
      convertedInput.tankHeight = this.convertUnitsService.value(input.tankHeight).from('m').to('ft');
      convertedInput.tankDiameter = this.convertUnitsService.value(input.tankDiameter).from('m').to('ft');
      convertedInput.tankThickness = this.convertUnitsService.value(input.tankThickness).from('m').to('ft');
      convertedInput.tankTemperature = this.convertUnitsService.value(input.tankTemperature).from('C').to('F') + 459.67;
      convertedInput.ambientTemperature = this.convertUnitsService.value(input.ambientTemperature).from('C').to('F') + 459.67;
      convertedInput.insulationThickness = this.convertUnitsService.value(input.insulationThickness).from('m').to('ft');
      convertedInput.customInsulationConductivity = this.convertUnitsService.value(input.customInsulationConductivity).from('W/mK').to('Btu/hr-ft-R');
    }
    return convertedInput;
  }

  convertResults(results: TankInsulationReductionResult, settings: Settings): TankInsulationReductionResult {
    if (settings.unitsOfMeasure != 'Imperial') {
      results.annualHeatLoss = this.convertUnitsService.value(results.annualHeatLoss).from('MMBtu').to('MJ');
    }
    return results;
  }

  checkTankThickness(tankThickness: number, settings: Settings) {
    let warningVal = 0.6;
    let warningValUnit = 'ft';
    if (settings.unitsOfMeasure !== 'Imperial') {
      //units of measure are metric, convert metric value to imperial equivalent
      tankThickness = this.convertUnitsService.value(tankThickness).from('m').to('ft');
      //the test value by default is in imperial, convert it to metric for warning message
      warningVal = this.convertUnitsService.value(warningVal).from('ft').to('m');
      warningValUnit = 'm';
    }
    //we are always comparing in imperial, 0.6 ft is limit
    if (tankThickness > 0.6) {
      return 'Tank thickness should be less than or equal to ' + (Math.round(warningVal * 100) / 100) + ' ' + warningValUnit + '.';
    } else {
      return null;
    }
  }

  checkInsulationThickness(insulationThickness: number, settings: Settings) {
    let warningVal = 1; //ft
    let warningValUnit = 'ft';
    if (settings.unitsOfMeasure !== 'Imperial') {
      //units of measure are metric, convert metric value to imperial equivalent
      insulationThickness = this.convertUnitsService.value(insulationThickness).from('m').to('ft');
      //the test value by default is in imperial, convert it to metric for warning message
      warningVal = this.convertUnitsService.value(warningVal).from('ft').to('m');
      warningValUnit = 'm';
    }
    //we are always comparing in imperial, 1 ft is limit
    if (insulationThickness > 1) {
      return 'Insulation thickness should be less than or equal to ' + (Math.round(warningVal * 100) / 100) + ' ' + warningValUnit + '.';
    } else {
      return null;
    }
  }

  getTankMaterialData(material: number): { conductivity: number, emissivity: number } {
    let tmpData: { conductivity: number, emissivity: number };
    if (material == 0) {
      //aluminum oxide
      tmpData = { conductivity: 17.3370, emissivity: 0.1 };
    } else if (material == 1) {
      //aluminum, new, bright
      tmpData = { conductivity: 144.4750, emissivity: 0.0 };
    } else if (material == 2) {
      //carbon steel, max 0.5% C
      tmpData = { conductivity: 31.0000, emissivity: 0.8 };
    } else if (material == 3) {
      //carbon steel, max 1.5% C
      tmpData = { conductivity: 18.0000, emissivity: 0.8 };
    } else if (material == 4) {
      //iron
      tmpData = { conductivity: 46.2320, emissivity: 0.8 };
    } else if (material == 5) {
      //iron, cast
      tmpData = { conductivity: 31.7545, emissivity: 0.8 };
    } else if (material == 6) {
      //stainless steel
      tmpData = { conductivity: 9.2464, emissivity: 0.3 };
    } else if (material == 7) {
      //steel, carbon 1%
      tmpData = { conductivity: 24.8497, emissivity: 0.8 };
    }
    return tmpData;
  }

  getInsulationConductivity(material: number) {
    let conductivity: number;
    if (material == 0) {
      //none
      conductivity = 0;
    } else if (material == 1) {
      //user defined
      conductivity = 0;
    } else if (material == 2) {
      //1000F Mineral Fiber Blanket, Type V
      conductivity = 0.056979167;
    } else if (material == 3) {
      //1000F Mineral Fiber Board, Type III
      conductivity = 0.038229167;
    } else if (material == 4) {
      //1000F Min.Fiber Pipe and Tank, Type IV
      conductivity = 0.0353125;
    } else if (material == 5) {
      //1200F Mineral Fiber Blanket, Type VII
      conductivity = 0.044444444;
    } else if (material == 6) {
      //1200F Mineral Fiber  Board, Type IVB
      conductivity = 0.034351852;
    } else if (material == 7) {
      //1800F Mineral Fiber  Board, Type V
      conductivity = 0.04325;
    } else if (material == 8) {
      //450F Mineral Fiber  Blanket, Type II
      conductivity = 0.033
    } else if (material == 9) {
      //450F Mineral Fiber  Board, Type IB
      conductivity = 0.025;
    } else if (material == 10) {
      //850F Mineral Fiber  Blanket, Type IV
      conductivity = 0.033095238;
    } else if (material == 11) {
      //850F MF Board, Type II
      conductivity = 0.03297619;
    } else if (material == 12) {
      //Air, athmosphere (gas)
      conductivity = 0.0138696;
    } else if (material == 13) {
      //Asbestos-cement
      conductivity = 1.196253;
    } else if (material == 14) {
      //Asbestos-cement board
      conductivity = 0.4299576;
    } else if (material == 15) {
      //Asbestos-cement sheets
      conductivity = 0.0959314;
    } else if (material == 16) {
      //Asphalt
      conductivity = 0.433425;
    } else if (material == 17) {
      //Cellular Glass,Type II, PIPE and TUBE
      conductivity = 0.043333333;
    } else if (material == 18) {
      //Cement plaster, sand aggregate
      conductivity = 0.416088;
    } else if (material == 19) {
      //Concrete, dense
      conductivity = 0.92464;
    } else if (material == 20) {
      //Concrete, lightweight
      conductivity = 0.11558;
    } else if (material == 21) {
      //Concrete, medium
      conductivity = 0.28895;
    } else if (material == 22) {
      //Fibreglass
      conductivity = 0.023116;
    } else if (material == 23) {
      //Finish CEMENT, C449-07
      conductivity = 0.090625;
    } else if (material == 24) {
      //Flexible Aerogel,Type III, Gr 1 Blanket
      conductivity = 0.016666667;
    } else if (material == 25) {
      //Foam glass
      conductivity = 0.0260055;
    } else if (material == 26) {
      //Glass Fiber Felt
      conductivity = 0.038333333;
    } else if (material == 27) {
      //Gypsum plaster, sand aggregate
      conductivity = 0.127138;
    } else if (material == 28) {
      //Gypsum plaster, vericulite aggregate
      conductivity = 0.144475;
    } else if (material == 29) {
      //High Temp Fiber BLANKET, Gr 6
      conductivity = 0.145595238;
    } else if (material == 30) {
      //MF Insulating CEMENT
      conductivity = 0.077083333;
    } else if (material == 31) {
      //MF Metal Mesh BLANKET, Type II
      conductivity = 0.039537037;
    } else if (material == 32) {
      //Polystyrene BOARD, Type IV, C578-11b
      conductivity = 0.016229167;
    } else if (material == 33) {
      //PVC
      conductivity = 0.109801;
    } else if (material == 34) {
      //Straw slab insulation, compressed
      conductivity = 0.052011;
    } else if (material == 35) {
      //Styrofoam
      conductivity = 0.0190707;
    } else if (material == 36) {
      //Vinyl ester
      conductivity = 0.144475;
    }
    return conductivity;
  }

  getJacketEmissivity(material: number) {
    if (material == 0) {
      //none
      return 0;
    } else if (material == 1) {
      //All Service Jacket
      return 0.9;
    } else if (material == 2) {
      //Aluminum Paint
      return 0.5;
    } else if (material == 3) {
      //Aluminum, new, bright
      return 0.04;
    } else if (material == 4) {
      //Aluminum, oxidized
      return 0.1;
    } else if (material == 5) {
      //Canvas
      return 0.9;
    } else if (material == 6) {
      //Colored Mastics
      return 0.9;
    } else if (material == 7) {
      //Copper, pure
      return 0.6;
    } else if (material == 8) {
      //Galvanized Steel
      return 0.1;
    } else if (material == 9) {
      //Iron
      return 0.8;
    } else if (material == 10) {
      //Painted Metal
      return 0.8;
    } else if (material == 11) {
      //PVC Jacketing
      return 0.9;
    } else if (material == 12) {
      //Roofing felt and black mastics
      return 0.9;
    } else if (material == 13) {
      //Stainless Steel, dull
      return 0.3;
    } else if (material == 14) {
      //Stainless Steel, new
      return 0.13;
    } else if (material == 15) {
      //Steel
      return 0.8;
    }
  }

}
