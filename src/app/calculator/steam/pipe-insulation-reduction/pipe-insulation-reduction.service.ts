import { Injectable } from '@angular/core';
import { PipeInsulationReductionInput, PipeInsulationReductionResult, PipeInsulationReductionResults } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StandaloneService } from '../../standalone.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class PipeInsulationReductionService {

  baselineData: PipeInsulationReductionInput;
  modificationData: PipeInsulationReductionInput;
  nps: Array<{ pipeSizeIn: number, pipeSizeMM: number, pipeSizeM: number, thickness: number }>;
  operatingHours: OperatingHours;

  constructor(private fb: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) {
    this.npsFactory();
  }

  initObject(settings: Settings, operatingHours: OperatingHours): PipeInsulationReductionInput {
    let hoursPerYear = 8760;
    if (operatingHours && operatingHours.hoursPerYear !== undefined && operatingHours.hoursPerYear !== null) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let obj: PipeInsulationReductionInput = {
      operatingHours: hoursPerYear,
      utilityType: 0,
      utilityCost: settings.fuelCost,
      naturalGasUtilityCost: settings.fuelCost,
      otherUtilityCost: settings.otherFuelCost || 0,
      pipeLength: 0,
      pipeDiameterSelection: 3,
      pipeDiameter: this.nps[3].pipeSizeM,
      pipeThickness: this.nps[3].thickness,
      pipeTemperature: 0,
      ambientTemperature: 0,
      windVelocity: 0,
      systemEfficiency: 0,
      insulationThickness: 0,
      pipeEmissivity: this.getPipeEmissivity(0),
      pipeJacketMaterialSelection: 0,
      jacketEmissivity: 0,
      pipeBaseMaterialSelection: 0,
      pipeMaterialCoefficients: this.getBaseMaterialCoefficients(0),
      insulationMaterialSelection: 0,
      insulationMaterialCoefficients: this.getInsulationMaterialCoefficients(0),
      heatedOrChilled: 0
    };
    return obj;
  }

  getFormFromObj(obj: PipeInsulationReductionInput, isBaseline: boolean): FormGroup {
    let form: FormGroup = this.fb.group({
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [{ value: obj.utilityType, disabled: !isBaseline }],
      utilityCost: [{ value: obj.utilityCost, disabled: !isBaseline }, [Validators.required, Validators.min(0)]],
      systemEfficiency: [obj.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      pipeLength: [obj.pipeLength, [Validators.required, Validators.min(0)]],
      pipeDiameterSelection: [obj.pipeDiameterSelection],
      windVelocity: [obj.windVelocity, [Validators.required, Validators.min(0)]],
      pipeTemperature: [obj.pipeTemperature, [Validators.required]],
      ambientTemperature: [obj.ambientTemperature, [Validators.required]],
      pipeBaseMaterialSelection: [obj.pipeBaseMaterialSelection],
      insulationMaterialSelection: [obj.insulationMaterialSelection],
      insulationThickness: [obj.insulationThickness],
      pipeJacketMaterialSelection: [obj.pipeJacketMaterialSelection],
      heatedOrChilled: [{ value: obj.heatedOrChilled, disabled: !isBaseline }]
    });

    if (obj.insulationMaterialSelection != 0) {
      form.controls.insulationThickness.setValidators([Validators.required, Validators.min(0), Validators.max(1000000)]);
    } else {
      form.controls.insulationThickness.clearValidators();
      form.controls.pipeJacketMaterialSelection.disable();
    }

    return form;
  }

  getObjFromForm(form: FormGroup, data: PipeInsulationReductionInput): PipeInsulationReductionInput {
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
    let obj: PipeInsulationReductionInput = {
      operatingHours: form.controls.operatingHours.value,
      utilityType: form.controls.utilityType.value,
      utilityCost: form.controls.utilityCost.value,
      naturalGasUtilityCost: naturalGasUtilityCost,
      otherUtilityCost: otherUtilityCost,
      pipeLength: form.controls.pipeLength.value,
      pipeDiameterSelection: form.controls.pipeDiameterSelection.value,
      pipeDiameter: this.nps[form.controls.pipeDiameterSelection.value].pipeSizeM,
      pipeThickness: this.nps[form.controls.pipeDiameterSelection.value].thickness,
      pipeTemperature: form.controls.pipeTemperature.value,
      ambientTemperature: form.controls.ambientTemperature.value,
      windVelocity: form.controls.windVelocity.value,
      systemEfficiency: form.controls.systemEfficiency.value,
      insulationThickness: insulationThickness,
      pipeEmissivity: this.getPipeEmissivity(form.controls.pipeBaseMaterialSelection.value),
      pipeJacketMaterialSelection: form.controls.pipeJacketMaterialSelection.value,
      jacketEmissivity: this.getJacketEmissivity(form.controls.pipeJacketMaterialSelection.value),
      pipeBaseMaterialSelection: form.controls.pipeBaseMaterialSelection.value,
      pipeMaterialCoefficients: this.getBaseMaterialCoefficients(form.controls.pipeBaseMaterialSelection.value),
      insulationMaterialSelection: form.controls.insulationMaterialSelection.value,
      insulationMaterialCoefficients: this.getInsulationMaterialCoefficients(form.controls.insulationMaterialSelection.value),
      heatedOrChilled: form.controls.heatedOrChilled.value
    };
    return obj;
  }

  generateExample(settings: Settings, isBaseline: boolean): PipeInsulationReductionInput {
    let example: PipeInsulationReductionInput;
    if (isBaseline) {
      example = {
        operatingHours: 8760,
        utilityType: 0,
        utilityCost: settings.fuelCost,
        naturalGasUtilityCost: settings.fuelCost,
        otherUtilityCost: settings.otherFuelCost || 0,
        pipeLength: 50,
        pipeDiameterSelection: 3,
        pipeDiameter: this.nps[3].pipeSizeM,
        pipeThickness: this.nps[3].thickness,
        pipeTemperature: 300,
        ambientTemperature: 80,
        windVelocity: 2,
        systemEfficiency: 90,
        insulationThickness: 0,
        pipeEmissivity: 0.8,
        pipeJacketMaterialSelection: 0,
        jacketEmissivity: this.getJacketEmissivity(0),
        pipeBaseMaterialSelection: 0,
        pipeMaterialCoefficients: this.getBaseMaterialCoefficients(0),
        insulationMaterialSelection: 0,
        insulationMaterialCoefficients: this.getInsulationMaterialCoefficients(0),
        heatedOrChilled: 0
      };
    } else {
      example = {
        operatingHours: 8760,
        utilityType: 0,
        utilityCost: settings.fuelCost,
        naturalGasUtilityCost: settings.fuelCost,
        otherUtilityCost: settings.otherFuelCost || 0,
        pipeLength: 50,
        pipeDiameterSelection: 3,
        pipeDiameter: this.nps[3].pipeSizeM,
        pipeThickness: this.nps[3].thickness,
        pipeTemperature: 300,
        ambientTemperature: 80,
        windVelocity: 2,
        systemEfficiency: 90,
        insulationThickness: 3,
        pipeEmissivity: 0.8,
        pipeJacketMaterialSelection: 8,
        jacketEmissivity: this.getJacketEmissivity(8),
        pipeBaseMaterialSelection: 0,
        pipeMaterialCoefficients: this.getBaseMaterialCoefficients(0),
        insulationMaterialSelection: 2,
        insulationMaterialCoefficients: this.getInsulationMaterialCoefficients(2),
        heatedOrChilled: 0
      };
    }
    return example;
  }

  getResults(settings: Settings, baseline: PipeInsulationReductionInput, modification?: PipeInsulationReductionInput) {
    let baselineCopy: PipeInsulationReductionInput = JSON.parse(JSON.stringify(baseline));
    let baselineResults: PipeInsulationReductionResult = this.calculate(baselineCopy, settings);
    let modificationResults: PipeInsulationReductionResult = {
      heatLength: 0,
      annualHeatLoss: 0,
      energyCost: 0,
      energySourceType: baselineResults.energySourceType,
      heatedOrChilled: baselineResults.heatedOrChilled
    };
    let annualHeatLossReduction: number = 0;
    let annualCostSavings: number = 0;
    if (modification) {
      let modificationCopy: PipeInsulationReductionInput = JSON.parse(JSON.stringify(modification));
      modificationCopy.utilityType = baselineResults.energySourceType;
      modificationCopy.heatedOrChilled = baselineResults.heatedOrChilled;
      modificationResults = this.calculate(modificationCopy, settings);
      annualHeatLossReduction = baselineResults.annualHeatLoss - modificationResults.annualHeatLoss;
      annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
    } else {
      modificationResults = baselineResults;
    }
    let pipeInsulationReductionResults: PipeInsulationReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualHeatSavings: annualHeatLossReduction,
      annualCostSavings: annualCostSavings
    };
    return pipeInsulationReductionResults;
  }

  calculate(input: PipeInsulationReductionInput, settings: Settings): PipeInsulationReductionResult {
    let convertedInput: PipeInsulationReductionInput = this.convertInputs(input, settings);
    let results: PipeInsulationReductionResult = this.standaloneService.pipeInsulationReduction(convertedInput);
    results.energySourceType = convertedInput.utilityType;
    results.heatedOrChilled = convertedInput.heatedOrChilled;
    results = this.convertResults(results, settings);
    if (results.energySourceType != 2 && settings.unitsOfMeasure != 'Imperial') {
      results.energyCost = results.annualHeatLoss * input.utilityCost / 1000;
    } else {
      results.energyCost = results.annualHeatLoss * input.utilityCost;
    }         
    return results;
  }

  convertInputs(input: PipeInsulationReductionInput, settings: Settings): PipeInsulationReductionInput {
    let convertedInput: PipeInsulationReductionInput = input;
    if (settings.unitsOfMeasure == 'Imperial') {
      convertedInput.pipeLength = this.convertUnitsService.value(input.pipeLength).from('ft').to('m');
      convertedInput.pipeTemperature = this.convertUnitsService.value(input.pipeTemperature).from('F').to('C') + 273.15;
      convertedInput.ambientTemperature = this.convertUnitsService.value(input.ambientTemperature).from('F').to('C') + 273.15;
      convertedInput.windVelocity = this.convertUnitsService.value(input.windVelocity).from('mph').to('m/s');
      convertedInput.insulationThickness = this.convertUnitsService.value(input.insulationThickness).from('in').to('m');
    } else {
      convertedInput.pipeTemperature = convertedInput.pipeTemperature + 273.15;
      convertedInput.ambientTemperature = convertedInput.ambientTemperature + 273.15;
    }
    return convertedInput;
  }

  convertResults(results: PipeInsulationReductionResult, settings: Settings): PipeInsulationReductionResult {
    if ( results.energySourceType != 2 && settings.unitsOfMeasure == 'Imperial') {
      results.annualHeatLoss = this.convertUnitsService.value(results.annualHeatLoss).from('Wh').to('MMBtu');
    } else if( results.energySourceType != 2 && settings.unitsOfMeasure != 'Imperial'){
      results.annualHeatLoss = this.convertUnitsService.value(results.annualHeatLoss).from('Wh').to('MJ');
    } else {
      results.annualHeatLoss = this.convertUnitsService.value(results.annualHeatLoss).from('Wh').to('kWh');
    }
    if( results.heatedOrChilled == 1){
      results.annualHeatLoss = results.annualHeatLoss * (-1);
    }

    return results;
  }

  // get base material coefficients - use this function until support is added for custom materials
  getBaseMaterialCoefficients(material: number) {
    if (material == 0) {
      //carbon steel
      return [0, 2.08333e-9, 3.67044e-19, -5.10833e-2, 7.9e1];
    } else if (material == 1) {
      //copper
      return [0, -1.66247e-7, 2.90813e-4, -2.28992e-1, 4.48114e2];
    } else if (material == 2) {
      //stainless steel
      return [0, 1.06090e-7, -1.93992e-4, 1.28270e-1, 1.05921e1];
    }
  }

  // get insulation material coefficients - use this function until support is added for custom materials
  getInsulationMaterialCoefficients(material: number) {
    if (material == 0) {
      //no insulation
      return [0, 0, 0, 0, 0];
    }
    else if (material == 1) {
      //calcium silicate
      return [3.15711e-13, -7.46414e-10, 7.36555e-7, -0.000224881, 0.07333604];
    } else if (material == 2) {
      //fiber glass
      return [1.57526e-12, -2.02822e-9, 8.6328e-7, 0, 0.006729488];
    } else if (material == 3) {
      //mineral fiber
      return [4.61278e-11, -7.42824e-8, 4.44951e-5, -0.011562712, 1.131348303];
    } else if (material == 4) {
      //glass and resin
      return [-2.11005e-11, 3.45583E-08, -2.02956E-05, 0.005220797, -0.467788289];
    } else if (material == 5) {
      //cellular glass
      return [2.15612E-11, -3.02553E-08, 1.59039E-05, -0.003524638, 0.314093419];
    } else if (material == 6) {
      //polystyrene
      return [-1.93278E-09, 2.32707E-06, -0.001050362, 0.210773437, -15.8404154];
    } else if (material == 7) {
      //polyofelin
      return [1.33333E-08, -1.60433E-05, 0.007230837, -1.446699957, 108.4294544];
    } else if (material == 8) {
      //flexible aerogel
      return [7.57576E-14, 1.04141E-10, -1.17653E-07, 6.54415E-05, 0.008307081];
    }
  }

  getPipeEmissivity(material: number) {
    if (material == 0) {
      return 0.8000;
    } else if (material == 1) {
      return 0.6000;
    } else if (material == 2) {
      return 0.3000;
    }
  }

  getJacketEmissivity(material: number) {
    if (material == 0) {
      return 0;
    } else if (material == 1) {
      return 0.9;
    } else if (material == 2) {
      return 0.5;
    } else if (material == 3) {
      return 0.04;
    } else if (material == 4) {
      return 0.1;
    } else if (material == 5) {
      return 0.9;
    } else if (material == 6) {
      return 0.9;
    } else if (material == 7) {
      return 0.6;
    } else if (material == 8) {
      return 0.1;
    } else if (material == 9) {
      return 0.8;
    } else if (material == 10) {
      return 0.8;
    } else if (material == 11) {
      return 0.9;
    } else if (material == 12) {
      return 0.9;
    } else if (material == 13) {
      return 0.3;
    } else if (material == 14) {
      return 0.13;
    } else if (material == 15) {
      return 0.8;
    }
  }

  npsFactory() {
    //MM = millimeters, M = meters, In = inches
    this.nps = [
      {
        pipeSizeIn: 0.25, pipeSizeMM: 8, pipeSizeM: 0.00635, thickness: 0.0022352
      },
      {
        pipeSizeIn: 0.5, pipeSizeMM: 15, pipeSizeM: 0.012699, thickness: 0.0027686
      },
      {
        pipeSizeIn: 0.75, pipeSizeMM: 20, pipeSizeM: 0.019049, thickness: 0.0028702
      },
      {
        pipeSizeIn: 1, pipeSizeMM: 25, pipeSizeM: 0.025399, thickness: 0.0033782
      },
      {
        pipeSizeIn: 1.25, pipeSizeMM: 32, pipeSizeM: 0.031748, thickness: 0.003556
      },
      {
        pipeSizeIn: 1.5, pipeSizeMM: 40, pipeSizeM: 0.038098, thickness: 0.003683
      },
      {
        pipeSizeIn: 2, pipeSizeMM: 50, pipeSizeM: 0.050798, thickness: 0.0039116
      },
      {
        pipeSizeIn: 2.5, pipeSizeMM: 65, pipeSizeM: 0.063497, thickness: 0.0051562
      },
      {
        pipeSizeIn: 3, pipeSizeMM: 80, pipeSizeM: 0.076196, thickness: 0.0054864
      },
      {
        pipeSizeIn: 3.5, pipeSizeMM: 90, pipeSizeM: 0.088896, thickness: 0.0057404
      },
      {
        pipeSizeIn: 4, pipeSizeMM: 100, pipeSizeM: 0.101595, thickness: 0.0060198
      },
      {
        pipeSizeIn: 5, pipeSizeMM: 125, pipeSizeM: 0.126994, thickness: 0.0065532
      },
      {
        pipeSizeIn: 6, pipeSizeMM: 150, pipeSizeM: 0.152393, thickness: 0.007112
      },
      {
        pipeSizeIn: 8, pipeSizeMM: 200, pipeSizeM: 0.20319, thickness: 0.0081788
      },
      {
        pipeSizeIn: 10, pipeSizeMM: 250, pipeSizeM: 0.253988, thickness: 0.009271
      },
      {
        pipeSizeIn: 12, pipeSizeMM: 300, pipeSizeM: 0.304785, thickness: 0.009525
      },
      {
        pipeSizeIn: 14, pipeSizeMM: 350, pipeSizeM: 0.355583, thickness: 0.009525
      },
      {
        pipeSizeIn: 16, pipeSizeMM: 400, pipeSizeM: 0.40638, thickness: 0.009525
      },
      {
        pipeSizeIn: 18, pipeSizeMM: 450, pipeSizeM: 0.457178, thickness: 0.009525
      },
      {
        pipeSizeIn: 20, pipeSizeMM: 500, pipeSizeM: 0.507975, thickness: 0.009525
      },
      {
        pipeSizeIn: 22, pipeSizeMM: 550, pipeSizeM: 0.558773, thickness: 0.009525
      },
      {
        pipeSizeIn: 24, pipeSizeMM: 600, pipeSizeM: 0.60957, thickness: 0.009525
      },
      {
        pipeSizeIn: 30, pipeSizeMM: 750, pipeSizeM: 0.761963, thickness: 0.009525
      },
      {
        pipeSizeIn: 32, pipeSizeMM: 800, pipeSizeM: 0.81276, thickness: 0.009525
      },
      {
        pipeSizeIn: 34, pipeSizeMM: 850, pipeSizeM: 0.863558, thickness: 0.009525
      },
      {
        pipeSizeIn: 36, pipeSizeMM: 900, pipeSizeM: 0.914355, thickness: 0.009525
      },
      {
        pipeSizeIn: 42, pipeSizeMM: 1050, pipeSizeM: 1.066748, thickness: 0.009525
      },
    ];
  }
}
