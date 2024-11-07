import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PHAST, PhastCo2EmissionsOutput, PhastCo2SavingsData, PhastResults } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Injectable()
export class Co2SavingsPhastService {

  co2SavingsField: BehaviorSubject<string>;
  baselineCo2SavingsData: BehaviorSubject<PhastCo2SavingsData>;
  modificationCo2SavingsData: BehaviorSubject<PhastCo2SavingsData>;

  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: UntypedFormBuilder) {
    this.co2SavingsField = new BehaviorSubject<string>(undefined);
    this.baselineCo2SavingsData = new BehaviorSubject<PhastCo2SavingsData>(undefined);
    this.modificationCo2SavingsData = new BehaviorSubject<PhastCo2SavingsData>(undefined);
  }

  getEmissionsForm(inputObj: PhastCo2SavingsData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      energyType: [inputObj.energyType],
      energySource: [inputObj.energySource],
      totalEmissionOutputRate: [inputObj.totalEmissionOutputRate],
      totalFuelEmissionOutputRate: [inputObj.totalFuelEmissionOutputRate],
      totalNaturalGasEmissionOutputRate: [inputObj.totalNaturalGasEmissionOutputRate],
      totalCoalEmissionOutputRate: [inputObj.totalCoalEmissionOutputRate],
      totalOtherEmissionOutputRate: [inputObj.totalOtherEmissionOutputRate],
      coalFuelType: [inputObj.coalFuelType],
      eafOtherFuelSource: [inputObj.eafOtherFuelSource],
      otherFuelType: [inputObj.otherFuelType],
      electricityUse: [inputObj.electricityUse],
      fuelType: [inputObj.fuelType],
      eGridRegion: [inputObj.eGridRegion],
      eGridSubregion: [inputObj.eGridSubregion],
      totalEmissionOutput: [inputObj.totalEmissionOutput],
      userEnteredBaselineEmissions: [inputObj.userEnteredBaselineEmissions],
      userEnteredModificationEmissions: [inputObj.userEnteredModificationEmissions],
      zipcode: [inputObj.zipcode],
    });

    return form;
  }

  getCo2SavingsData(form: UntypedFormGroup): PhastCo2SavingsData {
    let obj: PhastCo2SavingsData = {
      energyType: form.controls.energyType.value,
      totalEmissionOutputRate: form.controls.totalEmissionOutputRate.value,
      totalFuelEmissionOutputRate: form.controls.totalFuelEmissionOutputRate.value,
      totalNaturalGasEmissionOutputRate: form.controls.totalNaturalGasEmissionOutputRate.value,
      totalCoalEmissionOutputRate: form.controls.totalCoalEmissionOutputRate.value,
      totalOtherEmissionOutputRate: form.controls.totalOtherEmissionOutputRate.value,
      coalFuelType: form.controls.coalFuelType.value,
      eafOtherFuelSource: form.controls.eafOtherFuelSource.value,
      otherFuelType: form.controls.otherFuelType.value,
      electricityUse: form.controls.electricityUse.value,
      energySource: form.controls.energySource.value,
      fuelType: form.controls.fuelType.value,
      eGridRegion: form.controls.eGridRegion.value,
      eGridSubregion: form.controls.eGridSubregion.value,
      totalEmissionOutput: form.controls.totalEmissionOutput.value,
      userEnteredBaselineEmissions: form.controls.userEnteredBaselineEmissions.value,
      userEnteredModificationEmissions: form.controls.userEnteredModificationEmissions.value,
      zipcode: form.controls.zipcode.value,
    };
    return obj;
  }

  setCo2SavingsDataSettingsForm(inputObj: PhastCo2SavingsData, settingsForm: UntypedFormGroup): UntypedFormGroup {
    settingsForm.patchValue({
      co2SavingsEnergyType: inputObj.energyType,
      co2SavingsEnergySource: inputObj.energySource,
      co2SavingsFuelType: inputObj.fuelType,
      totalEmissionOutputRate: inputObj.totalEmissionOutputRate,
      totalFuelEmissionOutputRate: inputObj.totalFuelEmissionOutputRate,
      totalNaturalGasEmissionOutputRate: inputObj.totalNaturalGasEmissionOutputRate,
      totalCoalEmissionOutputRate: inputObj.totalCoalEmissionOutputRate,
      totalOtherEmissionOutputRate: inputObj.totalOtherEmissionOutputRate,
      coalFuelType: inputObj.coalFuelType,
      eafOtherFuelSource: inputObj.eafOtherFuelSource,
      otherFuelType: inputObj.otherFuelType,
      electricityUse: inputObj.electricityUse,
      eGridRegion: inputObj.eGridRegion,
      eGridSubregion: inputObj.eGridSubregion,
      totalEmissionOutput: inputObj.totalEmissionOutput,
      userEnteredBaselineEmissions: inputObj.userEnteredBaselineEmissions,
      userEnteredModificationEmissions: inputObj.userEnteredModificationEmissions,
      zipcode: inputObj.zipcode,
    });

    return settingsForm;
  }

  getCo2SavingsDataFromSettingsForm(settingsForm: UntypedFormGroup): PhastCo2SavingsData {
    let obj: PhastCo2SavingsData = {
      energyType: settingsForm.controls.co2SavingsEnergyType.value,
      energySource: settingsForm.controls.co2SavingsEnergySource.value,
      fuelType: settingsForm.controls.co2SavingsFuelType.value,
      totalEmissionOutputRate: settingsForm.controls.totalEmissionOutputRate.value,
      totalFuelEmissionOutputRate: settingsForm.controls.totalFuelEmissionOutputRate.value,
      totalNaturalGasEmissionOutputRate: settingsForm.controls.totalNaturalGasEmissionOutputRate.value,
      totalCoalEmissionOutputRate: settingsForm.controls.totalCoalEmissionOutputRate.value,
      totalOtherEmissionOutputRate: settingsForm.controls.totalOtherEmissionOutputRate.value,
      coalFuelType: settingsForm.controls.coalFuelType.value,
      eafOtherFuelSource: settingsForm.controls.eafOtherFuelSource.value,
      otherFuelType: settingsForm.controls.otherFuelType.value,
      electricityUse: settingsForm.controls.electricityUse.value,
      eGridRegion: settingsForm.controls.eGridRegion.value,
      eGridSubregion: settingsForm.controls.eGridSubregion.value,
      totalEmissionOutput: settingsForm.controls.totalEmissionOutput.value,
      userEnteredBaselineEmissions: settingsForm.controls.userEnteredBaselineEmissions.value,
      userEnteredModificationEmissions: settingsForm.controls.userEnteredModificationEmissions.value,
      zipcode: settingsForm.controls.zipcode.value,
    };

    return obj;
  }

  getCo2SavingsDataFromSettingsObject(settings: Settings): PhastCo2SavingsData {
    let energyTypeFromAssessment: string;
    if (settings.energySourceType == 'Fuel' || settings.energySourceType == 'Steam') {
      energyTypeFromAssessment = 'fuel';
    } else if (settings.energySourceType == 'Electricity') {
      energyTypeFromAssessment = 'electricity';
    } 
    if (!settings.co2SavingsEnergySource){
      settings.co2SavingsEnergySource = 'Natural Gas';
    }
    if (!settings.co2SavingsFuelType){
      settings.co2SavingsFuelType = 'Natural Gas';
    }
    if (!settings.zipcode){
      settings.zipcode = '00000';
    }
    let obj: PhastCo2SavingsData = {
      energyType: energyTypeFromAssessment,
      energySource: settings.co2SavingsEnergySource,
      fuelType: settings.co2SavingsFuelType,
      totalEmissionOutputRate: settings.totalEmissionOutputRate,
      totalFuelEmissionOutputRate: settings.totalFuelEmissionOutputRate,
      totalNaturalGasEmissionOutputRate: settings.totalNaturalGasEmissionOutputRate,
      totalCoalEmissionOutputRate: settings.totalCoalEmissionOutputRate,
      totalOtherEmissionOutputRate: settings.totalOtherEmissionOutputRate,
      coalFuelType: settings.coalFuelType,
      eafOtherFuelSource: settings.eafOtherFuelSource,
      otherFuelType: settings.otherFuelType,
      electricityUse: settings.electricityUse,
      eGridRegion: settings.eGridRegion,
      eGridSubregion: settings.eGridSubregion,
      totalEmissionOutput: settings.totalEmissionOutput,
      userEnteredBaselineEmissions: settings.userEnteredBaselineEmissions,
      userEnteredModificationEmissions: settings.userEnteredModificationEmissions,
      zipcode: settings.zipcode,
    };

    return obj;
  }

  getHourlyTotalEmissionsOutput(data: PhastCo2SavingsData, settings: Settings, isCombinedEnergy?: boolean): number {
    //use copy for conversion data
    let dataCpy: PhastCo2SavingsData = JSON.parse(JSON.stringify(data));
    let totalEmissionsResult: number;
    let totalEmissionOutputRate: number = dataCpy.totalEmissionOutputRate;
    if (isCombinedEnergy) {
      totalEmissionOutputRate = dataCpy.totalFuelEmissionOutputRate;
    }

    // * totalEmissionOutputRate is only GJ/MMBTu in fuel
    if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
      totalEmissionOutputRate = totalEmissionOutputRate / conversionHelper;
    }

    dataCpy.electricityUse = this.checkConvertEnergyResultValue(dataCpy.electricityUse, settings.energyResultUnit, settings)
    
    if (totalEmissionOutputRate && dataCpy.electricityUse) {
      //set results on original obj
      totalEmissionsResult = (totalEmissionOutputRate) * (dataCpy.electricityUse / 1000);
    } else {
      totalEmissionsResult = 0;
    }
    return totalEmissionsResult;
  }

  // * phastEnergyUnit is baseEnergyUnit, resultEnergyUnit or other depending on context
  checkConvertEnergyResultValue(energyValue: number, phastEnergyUnit: string, settings: Settings) {
    let emissionsUnit = settings.unitsOfMeasure != 'Imperial'? 'MMBtu' : 'GJ';
    let shouldConvert: boolean = phastEnergyUnit !== emissionsUnit;

    if (shouldConvert) {
      energyValue = this.convertUnitsService.convertValue(energyValue, phastEnergyUnit, emissionsUnit);
    }
    return energyValue;
  }

  /**
 * Returns total emissions output in tons (imperial) or tonne (metric)
 * @param phast - emissions output rates in GJ/MMBtu
 */
  setCo2EmissionsResults(phast: PHAST, results: PhastResults, settings: Settings): PhastCo2EmissionsOutput {
    let phastCopy: PHAST = JSON.parse(JSON.stringify(phast)); 
    let resultsCopy: PhastResults = JSON.parse(JSON.stringify(results)); 
    let co2EmissionsOutput: PhastCo2EmissionsOutput = {
      hourlyTotalEmissionOutput: undefined,
      emissionsSavings: undefined,
      totalEmissionOutput: undefined,
      fuelEmissionOutput: undefined,
      electricityEmissionOutput: undefined,
      electrodeEmissionsOutput: undefined,
      otherFuelEmissionsOutput: undefined,
      coalCarbonEmissionsOutput: undefined,
    };

    if (settings.energySourceType == 'Electricity') { 
      if (settings.furnaceType == 'Electric Arc Furnace (EAF)') { 
        if (settings.unitsOfMeasure != 'Imperial') {
          co2EmissionsOutput.fuelEmissionOutput = this.convertUnitsService.value(co2EmissionsOutput.fuelEmissionOutput).from('GJ').to('MMBtu');
          co2EmissionsOutput.otherFuelEmissionsOutput = this.convertUnitsService.value(co2EmissionsOutput.otherFuelEmissionsOutput).from('GJ').to('MMBtu');
        }

        // 1tonne / 1000kW * 1Mw/1000kW
        let hourlyElectricityEmissionOutput: number = phastCopy.co2SavingsData.totalEmissionOutputRate * 1/1000 * resultsCopy.hourlyEAFResults.electricEnergyUsed * 1/1000;
        // 1tonne / 1000kW or 1tonne / 1000kg
        let hourlyFuelEmissionOutput = resultsCopy.hourlyEAFResults.naturalGasUsed * phastCopy.co2SavingsData.totalNaturalGasEmissionOutputRate * 1/1000;
        let hourlyElectrodeUse: number = resultsCopy.hourlyEAFResults.electrodeUse;
        if (settings.unitsOfMeasure === 'Imperial') {
          hourlyElectrodeUse = this.convertUnitsService.value(hourlyElectrodeUse).from('lb').to('kg');
        }

        // Carbon is 12 grams per 1 "mol" (that is a count of atoms/molecules).  Carbon dioxide is 44 grams per mol.  there is one mole of C in each mole of CO2
        // X kg/hr electrode used * (1 kmol C/12 kg C) * (1 kmol CO2/1 kmol C) * (44kg CO2/kmol CO2) = X*44/12 kg CO2/hr
        let hourlyElectrodeEmissionsOutput = hourlyElectrodeUse * (44/12) * 1/1000;
        co2EmissionsOutput.electrodeEmissionsOutput = hourlyElectrodeEmissionsOutput * phastCopy.operatingHours.hoursPerYear;
        let hourlyCoalCarbonEmissionsOutput = resultsCopy.hourlyEAFResults.coalCarbonUsed * phastCopy.co2SavingsData.totalCoalEmissionOutputRate * 1/1000;
        let hourlyOtherFuelEmissionsOutput = resultsCopy.hourlyEAFResults.otherFuelUsed * phastCopy.co2SavingsData.totalOtherEmissionOutputRate * 1/1000;
        co2EmissionsOutput.hourlyTotalEmissionOutput = hourlyElectricityEmissionOutput + hourlyFuelEmissionOutput + hourlyCoalCarbonEmissionsOutput + hourlyElectrodeEmissionsOutput + hourlyOtherFuelEmissionsOutput;
        
        co2EmissionsOutput.electricityEmissionOutput = hourlyElectricityEmissionOutput * phastCopy.operatingHours.hoursPerYear;
        co2EmissionsOutput.fuelEmissionOutput = hourlyFuelEmissionOutput * phastCopy.operatingHours.hoursPerYear;
        co2EmissionsOutput.coalCarbonEmissionsOutput = hourlyCoalCarbonEmissionsOutput * phastCopy.operatingHours.hoursPerYear;
        co2EmissionsOutput.otherFuelEmissionsOutput = hourlyOtherFuelEmissionsOutput * phastCopy.operatingHours.hoursPerYear;
        co2EmissionsOutput.totalEmissionOutput = co2EmissionsOutput.electricityEmissionOutput + co2EmissionsOutput.fuelEmissionOutput + co2EmissionsOutput.coalCarbonEmissionsOutput + co2EmissionsOutput.electrodeEmissionsOutput + co2EmissionsOutput.otherFuelEmissionsOutput;
        
      } else {
        let fuelHeatInputTotal: number = 0;
        if (phastCopy.losses && phastCopy.losses.energyInputExhaustGasLoss) {
          phastCopy.losses.energyInputExhaustGasLoss.forEach(exGas => {
            fuelHeatInputTotal += exGas.totalHeatInput;
          });
        }
        phastCopy.co2SavingsData.electricityUse = resultsCopy.electricalHeatDelivered + resultsCopy.electricalHeaterLosses;
        let hourlyElectricityEmissionOutput: number = this.getHourlyTotalEmissionsOutput(phastCopy.co2SavingsData, settings);
        fuelHeatInputTotal = this.checkConvertEnergyResultValue(fuelHeatInputTotal, settings.energyResultUnit, settings);
        let hourlyFuelEmissionOutput = fuelHeatInputTotal * phastCopy.co2SavingsData.totalFuelEmissionOutputRate;
        co2EmissionsOutput.hourlyTotalEmissionOutput = hourlyElectricityEmissionOutput + hourlyFuelEmissionOutput;
        // 1tonne / 1000kW or 1tonne / 1000kg
        co2EmissionsOutput.fuelEmissionOutput = hourlyFuelEmissionOutput * phastCopy.operatingHours.hoursPerYear * 1/1000;
        co2EmissionsOutput.electricityEmissionOutput = hourlyElectricityEmissionOutput * phastCopy.operatingHours.hoursPerYear * 1/1000;
        co2EmissionsOutput.totalEmissionOutput = co2EmissionsOutput.electricityEmissionOutput + co2EmissionsOutput.fuelEmissionOutput;
      }
      
    } else {
      phastCopy.co2SavingsData.electricityUse = results.grossHeatInput;
      co2EmissionsOutput.hourlyTotalEmissionOutput = this.getHourlyTotalEmissionsOutput(phastCopy.co2SavingsData, settings, true);   
      co2EmissionsOutput.totalEmissionOutput = co2EmissionsOutput.hourlyTotalEmissionOutput * phastCopy.operatingHours.hoursPerYear;   
    }

    if (settings.unitsOfMeasure !== 'Metric') {
      co2EmissionsOutput.hourlyTotalEmissionOutput = co2EmissionsOutput.hourlyTotalEmissionOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.hourlyTotalEmissionOutput).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.emissionsSavings = co2EmissionsOutput.emissionsSavings !== undefined? this.convertUnitsService.value(co2EmissionsOutput.emissionsSavings).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.totalEmissionOutput = co2EmissionsOutput.totalEmissionOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.totalEmissionOutput).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.fuelEmissionOutput = co2EmissionsOutput.fuelEmissionOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.fuelEmissionOutput).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.electricityEmissionOutput = co2EmissionsOutput.electricityEmissionOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.electricityEmissionOutput).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.electrodeEmissionsOutput = co2EmissionsOutput.electrodeEmissionsOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.electrodeEmissionsOutput).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.otherFuelEmissionsOutput = co2EmissionsOutput.otherFuelEmissionsOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.otherFuelEmissionsOutput).from('tonne').to('ton') : undefined;
      co2EmissionsOutput.coalCarbonEmissionsOutput = co2EmissionsOutput.coalCarbonEmissionsOutput !== undefined? this.convertUnitsService.value(co2EmissionsOutput.coalCarbonEmissionsOutput).from('tonne').to('ton') : undefined;
    }
    return co2EmissionsOutput;
}

getDefaultCO2Different(): PhastCo2SavingsDifferent {
  return {
    totalEmissionOutputRate: false,
    totalFuelEmissionOutputRate: false,
    energySource: false,
    fuelType: false,
    totalNaturalGasEmissionOutputRate: false,
    totalCoalEmissionOutputRate: false,
    totalOtherEmissionOutputRate: false,
    coalFuelType: false,
    eafOtherFuelSource: false,
    otherFuelType: false,
  }
}


}

export interface PhastCo2SavingsDifferent {
  totalEmissionOutputRate?: boolean,
  totalFuelEmissionOutputRate?: boolean,
  totalNaturalGasEmissionOutputRate?: boolean,
  totalCoalEmissionOutputRate?: boolean,
  totalOtherEmissionOutputRate?: boolean,
  coalFuelType?: boolean,
  eafOtherFuelSource?: boolean,
  otherFuelType?: boolean,
  electricityUse?: boolean,
  energySource?: boolean,
  fuelType?: boolean,
}
