import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../../shared/models/phast/losses/flueGas';

@Injectable()
export class FlueGasLossesService {

  constructor(private formBuilder: FormBuilder) {
  }


  initFormVolume(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['', Validators.required],
      'excessAirPercentage': ['', Validators.required],
      'o2InFlueGas': ['', Validators.required],
      'combustionAirTemperature': ['', Validators.required],
      'fuelTemperature': ['', Validators.required],
      'CH4': ['', Validators.required],
      'C2H6': ['', Validators.required],
      'N2': ['', Validators.required],
      'H2': ['', Validators.required],
      'C3H8': ['', Validators.required],
      'C4H10_CnH2n': ['', Validators.required],
      'H2O': ['', Validators.required],
      'CO': ['', Validators.required],
      'CO2': ['', Validators.required],
      'SO2': ['', Validators.required],
      'O2': ['', Validators.required],
      'name': ['Loss #' + lossNum]
    })
  }

  initFormMass(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'gasTypeId': [1, Validators.required],
      'flueGasTemperature': ['', Validators.required],
      'oxygenCalculationMethod': ['', Validators.required],
      'excessAirPercentage': ['', Validators.required],
      'o2InFlueGas': ['', Validators.required],
      'combustionAirTemperature': ['', Validators.required],
      'fuelTemperature': ['', Validators.required],
      'moistureInAirComposition': ['', Validators.required],
      'ashDischargeTemperature': ['', Validators.required],
      'unburnedCarbonInAsh': ['', Validators.required],
      'carbon': ['', Validators.required],
      'hydrogen': ['', Validators.required],
      'sulphur': ['', Validators.required],
      'inertAsh': ['', Validators.required],
      'o2': ['', Validators.required],
      'moisture': ['', Validators.required],
      'nitrogen': ['', Validators.required],
      'name': ['Loss #' + lossNum]
    })
  }

  initByVolumeFormFromLoss(loss: FlueGas): FormGroup {
    return this.formBuilder.group({
      'gasTypeId': [loss.flueGasByVolume.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByVolume.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByVolume.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByVolume.excessAirPercentage, Validators.required],
      'o2InFlueGas': [loss.flueGasByVolume.o2InFlueGas, Validators.required],
      'combustionAirTemperature': [loss.flueGasByVolume.combustionAirTemperature, Validators.required],
      'fuelTemperature': [loss.flueGasByVolume.fuelTemperature, Validators.required],
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
    })
  }

  initByMassFormFromLoss(loss: FlueGas): FormGroup {
    return this.formBuilder.group({
      'gasTypeId': [loss.flueGasByMass.gasTypeId, Validators.required],
      'flueGasTemperature': [loss.flueGasByMass.flueGasTemperature, Validators.required],
      'oxygenCalculationMethod': [loss.flueGasByMass.oxygenCalculationMethod, Validators.required],
      'excessAirPercentage': [loss.flueGasByMass.excessAirPercentage, Validators.required],
      'o2InFlueGas': [loss.flueGasByMass.o2InFlueGas, Validators.required],
      'combustionAirTemperature': [loss.flueGasByMass.combustionAirTemperature, Validators.required],
      'fuelTemperature': [loss.flueGasByMass.fuelTemperature, Validators.required],
      'moistureInAirComposition': [loss.flueGasByMass.moistureInAirComposition, Validators.required],
      'ashDischargeTemperature': [loss.flueGasByMass.ashDischargeTemperature, Validators.required],
      'unburnedCarbonInAsh': [loss.flueGasByMass.unburnedCarbonInAsh, Validators.required],
      'carbon': [loss.flueGasByMass.carbon, Validators.required],
      'hydrogen': [loss.flueGasByMass.hydrogen, Validators.required],
      'sulphur': [loss.flueGasByMass.sulphur, Validators.required],
      'inertAsh': [loss.flueGasByMass.inertAsh, Validators.required],
      'o2': [loss.flueGasByMass.o2, Validators.required],
      'moisture': [loss.flueGasByMass.moisture, Validators.required],
      'nitrogen': [loss.flueGasByMass.nitrogen, Validators.required],
      'name': [loss.name]
    })
  }

  buildByMassLossFromForm(form: FormGroup): FlueGas {
    let tmpFlueGas: FlueGas = {
      name: form.controls.name.value,
      flueGasByMass: {
        gasTypeId: form.controls.gasTypeId.value,
        flueGasTemperature: form.controls.flueGasTemperature.value,
        oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
        excessAirPercentage: form.controls.excessAirPercentage.value,
        o2InFlueGas: form.controls.o2InFlueGas.value,
        combustionAirTemperature: form.controls.combustionAirTemperature.value,
        fuelTemperature: form.controls.fuelTemperature.value,
        ashDischargeTemperature: form.controls.ashDischargeTemperature.value,
        moistureInAirComposition: form.controls.moistureInAirComposition.value,
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
    return tmpFlueGas;
  }

  buildByVolumeLossFromForm(form: FormGroup): FlueGas {
    let tmpFlueGas: FlueGas = {
      name: form.controls.name.value,
      flueGasByVolume: {
        gasTypeId: form.controls.gasTypeId.value,
        flueGasTemperature: form.controls.flueGasTemperature.value,
        oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
        excessAirPercentage: form.controls.excessAirPercentage.value,
        o2InFlueGas: form.controls.o2InFlueGas.value,
        combustionAirTemperature: form.controls.combustionAirTemperature.value,
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
    return tmpFlueGas;
  }

  checkFlueGasByVolumeWarnings(flueGas: FlueGasByVolume): FlueGasWarnings {
    return {
      combustionAirTempWarning: this.checkCombustionAirTemp(flueGas),
      excessAirWarning: this.checkExcessAirWarning(flueGas),
      o2Warning: this.checkO2Warning(flueGas)
    }
  }

  checkFlueGasByMassWarnings(flueGas: FlueGasByMass): FlueGasWarnings {
    return {
      moistureInAirCompositionWarning: this.checkMoistureInAir(flueGas),
      unburnedCarbonInAshWarning: this.checkUnburnedCarbon(flueGas),
      combustionAirTempWarning: this.checkCombustionAirTemp(flueGas),
      excessAirWarning: this.checkExcessAirWarning(flueGas),
      o2Warning: this.checkO2Warning(flueGas)
    }
  }
  checkMoistureInAir(flueGas: FlueGasByMass): string {
    if (flueGas.moistureInAirComposition < 0) {
      return 'Moisture in Combustion Air must be equal or greater than 0%'
    } else if (flueGas.moistureInAirComposition > 100) {
      return 'Moisture in Combustion Air must be less than or equal to 100%';
    } else {
      return null;
    }
  }
  checkUnburnedCarbon(flueGas: FlueGasByMass): string {
    if (flueGas.unburnedCarbonInAsh < 0) {
      return 'Unburned Carbon in Ash must be equal or greater than 0%'
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
  checkO2Warning(flueGas: FlueGasByMass | FlueGasByVolume): string {
    if (flueGas.o2InFlueGas < 0 || flueGas.o2InFlueGas > 20.99999) {
      return 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
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

export interface FlueGasWarnings {
  moistureInAirCompositionWarning?: string;
  unburnedCarbonInAshWarning?: string;
  combustionAirTempWarning: string;
  excessAirWarning: string;
  o2Warning: string
}