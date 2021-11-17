import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlueGas, FlueGasByMass, FlueGasByVolume, FlueGasWarnings } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class FlueGasFormService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initEmptyVolumeForm(settings: Settings, loss?: number): FormGroup {
    let ambientAirTemp: number = 60;
    if (settings.unitsOfMeasure != 'Imperial') {
      ambientAirTemp = this.convertUnitsService.value(ambientAirTemp).from('F').to('C')
    }

    let defaultMoistureInAirComp: any = .0077;
    let lossNumber: number = 0;
    if (loss) {
      defaultMoistureInAirComp = 0;
      lossNumber = loss;
    }
    let formGroup = this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': [0, Validators.required],
      'oxygenCalculationMethod': ['Excess Air', Validators.required],
      'excessAirPercentage': [0, Validators.required],
      'o2InFlueGas': [0, Validators.required],
      'combustionAirTemperature': [0, [Validators.required]],
      'moistureInAirCombustion': [defaultMoistureInAirComp, [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [0, Validators.required],
      'ambientAirTemp': [ambientAirTemp, Validators.required],
      'CH4': [0, Validators.required],
      'C2H6': [0, Validators.required],
      'N2': [0, Validators.required],
      'H2': [0, Validators.required],
      'C3H8': [0, Validators.required],
      'C4H10_CnH2n': [0, Validators.required],
      'H2O': [0, Validators.required],
      'CO': [0, Validators.required],
      'CO2': [0, Validators.required],
      'SO2': [0, Validators.required], 
      'O2': [0, Validators.required],
      'name': ['Loss #' + lossNumber]
    });

    if (!loss) {
      formGroup.addControl('heatInput', new FormControl('', [Validators.required, Validators.min(0)]));
    }

    formGroup = this.setValidators(formGroup);
    return formGroup;
  }

  initEmptyMassForm(settings: Settings, loss?: number): FormGroup {
    let defaultMoistureInAirComp: any = .0077;
    let lossNumber: number = 0;
    if (loss) {
      defaultMoistureInAirComp = 0;
      lossNumber = loss;
    }

    let ambientAirTemp: number = 60;
    if (settings.unitsOfMeasure != 'Imperial') {
      ambientAirTemp = this.convertUnitsService.value(ambientAirTemp).from('F').to('C')
    }

     let formGroup = this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': [0, Validators.required],
      'oxygenCalculationMethod': ['Excess Air', Validators.required],
      'excessAirPercentage': [0, Validators.required],
      'o2InFlueGas': [0, Validators.required],
      'combustionAirTemperature': [0, [Validators.required]],
      'fuelTemperature': [0, Validators.required],
      'ambientAirTemp': [ambientAirTemp, Validators.required],
      'moistureInAirCombustion': [defaultMoistureInAirComp, [Validators.required, Validators.min(0), Validators.max(100)]],
      'ashDischargeTemperature': [0, Validators.required],
      'unburnedCarbonInAsh': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'carbon': [0, Validators.required],
      'hydrogen': [0, Validators.required],
      'sulphur': [0, Validators.required],
      'inertAsh': [0, Validators.required],
      'o2': [0, Validators.required],
      'moisture': [0, Validators.required],
      'nitrogen': [0, Validators.required],
      'name': ['Loss #' + lossNumber]
    });

    if (!loss) {
      formGroup.addControl('heatInput', new FormControl(0, [Validators.required, Validators.min(0)]));
    }

    formGroup = this.setValidators(formGroup);
    return formGroup;
  }

  initByVolumeFormFromLoss(loss: FlueGas, inAssessment = true): FormGroup {
    let formGroup = this.formBuilder.group({
      'gasTypeId': [loss.flueGasByVolume.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByVolume.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByVolume.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByVolume.excessAirPercentage, Validators.required],
      'o2InFlueGas': [loss.flueGasByVolume.o2InFlueGas, Validators.required],
      'combustionAirTemperature': [loss.flueGasByVolume.combustionAirTemperature, [Validators.required, Validators.min(0)]],
      'moistureInAirCombustion': [loss.flueGasByVolume.moistureInAirCombustion, [Validators.required, Validators.min(0), Validators.max(100)]],
      'fuelTemperature': [loss.flueGasByVolume.fuelTemperature, Validators.required],
      'ambientAirTemp': [loss.flueGasByVolume.ambientAirTemp, Validators.required],
      'CH4': [loss.flueGasByVolume.CH4, Validators.required],
      'C2H6': [loss.flueGasByVolume.C2H6, Validators.required],
      'N2': [loss.flueGasByVolume.N2, Validators.required],
      'H2': [loss.flueGasByVolume.H2, Validators.required],
      'C3H8': [loss.flueGasByVolume.C3H8, Validators.required],
      'C4H10_CnH2n': [loss.flueGasByVolume.C4H10_CnH2n, Validators.required],
      'H2O': [loss.flueGasByVolume.H2O, Validators.required],
      'CO': [loss.flueGasByVolume.CO, Validators.required],
      'CO2': [loss.flueGasByVolume.CO2, Validators.required],
      'SO2': [loss.flueGasByVolume.SO2, Validators.required],
      'O2': [loss.flueGasByVolume.O2, Validators.required],
      'name': [loss.name]
    });

    if (!inAssessment) {
      formGroup.addControl('heatInput', new FormControl(loss.flueGasByVolume.heatInput, [Validators.required, Validators.min(0)]));
    }

    formGroup = this.setValidators(formGroup);
    return formGroup;
  }

  initByMassFormFromLoss(loss: FlueGas, inAssessment = true): FormGroup {
      let formGroup = this.formBuilder.group({
      'gasTypeId': [loss.flueGasByMass.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByMass.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByMass.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByMass.excessAirPercentage, Validators.required],
      'o2InFlueGas': [loss.flueGasByMass.o2InFlueGas, Validators.required],
      'ambientAirTemp': [loss.flueGasByMass.ambientAirTemp, Validators.required],
      'combustionAirTemperature': [loss.flueGasByMass.combustionAirTemperature, [Validators.required, Validators.min(0)]],
      'fuelTemperature': [loss.flueGasByMass.fuelTemperature, Validators.required],
      'moistureInAirCombustion': [loss.flueGasByMass.moistureInAirCombustion, [Validators.required, Validators.min(0), Validators.max(100)]],
      'ashDischargeTemperature': [loss.flueGasByMass.ashDischargeTemperature, Validators.required],
      'unburnedCarbonInAsh': [loss.flueGasByMass.unburnedCarbonInAsh, [Validators.required, Validators.min(0), Validators.max(100)]],
      'carbon': [loss.flueGasByMass.carbon, Validators.required],
      'hydrogen': [loss.flueGasByMass.hydrogen, Validators.required],
      'sulphur': [loss.flueGasByMass.sulphur, Validators.required],
      'inertAsh': [loss.flueGasByMass.inertAsh, Validators.required],
      'o2': [loss.flueGasByMass.o2, Validators.required],
      'moisture': [loss.flueGasByMass.moisture, Validators.required],
      'nitrogen': [loss.flueGasByMass.nitrogen, Validators.required],
      'name': [loss.name]
    });

    if (!inAssessment) {
      formGroup.addControl('heatInput', new FormControl(loss.flueGasByMass.heatInput, [Validators.required, Validators.min(0)]));
    }

    formGroup = this.setValidators(formGroup);
    return formGroup;
  }

  setValidators(formGroup: FormGroup, inModal = false): FormGroup {
    formGroup = this.setFlueGasTempValidators(formGroup);
    formGroup = this.setCombustionAirTempValidators(formGroup);

    if (inModal) {
      formGroup.controls.heatInput.setValidators([]);
      formGroup.controls.heatInput.updateValueAndValidity();
    }
    return formGroup;
  }

  setCombustionAirTempValidators(formGroup: FormGroup) {
    let flueGasTemp = formGroup.controls.flueGasTemperature.value;
    if (flueGasTemp) {
      formGroup.controls.combustionAirTemperature.setValidators([Validators.required, Validators.max(flueGasTemp)]);
      formGroup.controls.combustionAirTemperature.markAsDirty();
      formGroup.controls.combustionAirTemperature.updateValueAndValidity();
    }
    return formGroup;
  }

  setFlueGasTempValidators(formGroup: FormGroup) {
    let combustionAirTemperature = formGroup.controls.combustionAirTemperature.value;
    if (combustionAirTemperature) {
      formGroup.controls.flueGasTemperature.setValidators([Validators.required, Validators.min(combustionAirTemperature)]);
      formGroup.controls.flueGasTemperature.markAsDirty();
      formGroup.controls.flueGasTemperature.updateValueAndValidity();
    }
    return formGroup;
  }

  buildByMassLossFromForm(form: FormGroup): FlueGas {
    let flueGas: FlueGas = {
      name: form.controls.name.value,
      flueGasType: "By Mass",
      flueGasByMass: {
        gasTypeId: form.controls.gasTypeId.value,
        flueGasTemperature: form.controls.flueGasTemperature.value,
        oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
        excessAirPercentage: form.controls.excessAirPercentage.value,
        o2InFlueGas: form.controls.o2InFlueGas.value,
        ambientAirTemp: form.controls.ambientAirTemp.value,
        combustionAirTemperature: form.controls.combustionAirTemperature.value,
        fuelTemperature: form.controls.fuelTemperature.value,
        ashDischargeTemperature: form.controls.ashDischargeTemperature.value,
        moistureInAirCombustion: form.controls.moistureInAirCombustion.value,
        unburnedCarbonInAsh: form.controls.unburnedCarbonInAsh.value,
        carbon: form.controls.carbon.value,
        hydrogen: form.controls.hydrogen.value,
        sulphur: form.controls.sulphur.value,
        inertAsh: form.controls.inertAsh.value,
        o2: form.controls.o2.value,
        moisture: form.controls.moisture.value,
        nitrogen: form.controls.nitrogen.value
      }
    }

    // in Standalone
    if (form.controls.heatInput) {
      flueGas.flueGasByMass.heatInput = form.controls.heatInput.value;
    }
    return flueGas;
  }

  buildByVolumeLossFromForm(form: FormGroup): FlueGas {
    let flueGas: FlueGas = {
      name: form.controls.name.value,
      flueGasType: "By Volume",
      flueGasByVolume: {
        gasTypeId: form.controls.gasTypeId.value,
        flueGasTemperature: form.controls.flueGasTemperature.value,
        oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
        excessAirPercentage: form.controls.excessAirPercentage.value,
        o2InFlueGas: form.controls.o2InFlueGas.value,
        ambientAirTemp: form.controls.ambientAirTemp.value,
        combustionAirTemperature: form.controls.combustionAirTemperature.value,
        moistureInAirCombustion: form.controls.moistureInAirCombustion.value,
        fuelTemperature: form.controls.fuelTemperature.value,
        CH4: form.controls.CH4.value,
        C2H6: form.controls.C2H6.value,
        N2: form.controls.N2.value,
        H2: form.controls.H2.value,
        C3H8: form.controls.C3H8.value,
        C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
        H2O: form.controls.H2O.value,
        CO: form.controls.CO.value,
        CO2: form.controls.CO2.value,
        SO2: form.controls.SO2.value,
        O2: form.controls.O2.value
      }
    }

    // in Standalone
    if (form.controls.heatInput) {
      flueGas.flueGasByVolume.heatInput = form.controls.heatInput.value;
    }
    return flueGas;
  }

  checkFlueGasByVolumeWarnings(flueGas: FlueGasByVolume, settings: Settings): FlueGasWarnings {
    return {
      moistureInAirCombustionWarning: this.checkMoistureInAir(flueGas),
      combustionAirTempWarning: this.checkCombustionAirTemp(flueGas),
      excessAirWarning: this.checkExcessAirWarning(flueGas),
      o2Warning: this.checkO2Warning(flueGas),
      flueGasTemp: this.checkFlueGasTemp(flueGas, settings)
    };
  }

  checkFlueGasByMassWarnings(flueGas: FlueGasByMass, settings: Settings): FlueGasWarnings {
    return {
      moistureInAirCombustionWarning: this.checkMoistureInAir(flueGas),
      unburnedCarbonInAshWarning: this.checkUnburnedCarbon(flueGas),
      combustionAirTempWarning: this.checkCombustionAirTemp(flueGas),
      excessAirWarning: this.checkExcessAirWarning(flueGas),
      o2Warning: this.checkO2Warning(flueGas),
      flueGasTemp: this.checkFlueGasTemp(flueGas, settings)
    };
  }

  checkFlueGasTemp(flueGas: FlueGasByMass | FlueGasByVolume, settings: Settings) {
    let flueGasTempMin: number = 212;
    if (settings.unitsOfMeasure == 'Metric') {
      flueGasTempMin = 100;
    }
    if (flueGas.flueGasTemperature && flueGas.flueGasTemperature < flueGasTempMin) {
      return `Flue Gas Temperature less than ${flueGasTempMin}, gases may be condensing in the
                flue and calculated efficiency may not be valid.`
    } else {
      return null;
    }
  }

  checkO2Warning(flueGas: FlueGasByMass | FlueGasByVolume): string {
    if (flueGas.o2InFlueGas < 0 || flueGas.o2InFlueGas >= 21) {
      return 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
    } else {
      return null;
    }
  }


  // Below checks still used in Assessment
  checkUnburnedCarbon(flueGas: FlueGasByMass): string {
    if (flueGas.unburnedCarbonInAsh < 0) {
      return 'Unburned Carbon in Ash must be equal or greater than 0%';
    } else if (flueGas.unburnedCarbonInAsh > 100) {
      return 'Unburned Carbon in Ash must be less than or equal to 100%';
    } else {
      return null;
    }
  }
  
  checkCombustionAirTemp(flueGas: FlueGasByMass | FlueGasByVolume): string {
    if (flueGas.combustionAirTemperature > flueGas.flueGasTemperature) {
      return "Combustion air temperature must be less than flue gas temperature";
    } else {
      return null;
    }
  }

  checkExcessAirWarning(flueGas: FlueGasByMass | FlueGasByVolume): string {
    if (flueGas.excessAirPercentage < 0) {
      return 'Excess Air must be greater than 0 percent';
    } else {
      return null;
    }
  }

   checkMoistureInAir(flueGas: FlueGasByMass): string {
    if (flueGas.moistureInAirCombustion < 0) {
      return 'Moisture in Combustion Air must be equal or greater than 0%';
    } else if (flueGas.moistureInAirCombustion > 100) {
      return 'Moisture in Combustion Air must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkWarningsExist(warnings: FlueGasWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}
