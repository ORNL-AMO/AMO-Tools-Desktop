import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Settings } from '../models/settings';
import { copyObject } from '../helperFunctions';

@Injectable()
export class AssessmentCo2SavingsService {

  co2SavingsField: BehaviorSubject<string>;
  baselineCo2SavingsData: BehaviorSubject<Co2SavingsData>;
  modificationCo2SavingsData: BehaviorSubject<Co2SavingsData>;

  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: UntypedFormBuilder) {
    this.co2SavingsField = new BehaviorSubject<string>(undefined);
    this.baselineCo2SavingsData = new BehaviorSubject<Co2SavingsData>(undefined);
    this.modificationCo2SavingsData = new BehaviorSubject<Co2SavingsData>(undefined);
   }

  getEmissionsForm(inputObj: Co2SavingsData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      energyType: [inputObj.energyType],
      energySource: [inputObj.energySource],
      totalEmissionOutputRate: [inputObj.totalEmissionOutputRate],
      electricityUse: [inputObj.electricityUse],
      fuelType: [inputObj.fuelType ],
      eGridRegion: [inputObj.eGridRegion],
      eGridSubregion: [inputObj.eGridSubregion],
      totalEmissionOutput: [inputObj.totalEmissionOutput],
      totalFuelEmissionOutputRate: [inputObj.totalFuelEmissionOutputRate],
      userEnteredBaselineEmissions: [inputObj.userEnteredBaselineEmissions],
      userEnteredModificationEmissions: [inputObj.userEnteredModificationEmissions],
      zipcode: [inputObj.zipcode],
    });

    return form;
  }

  getCo2SavingsData(form: UntypedFormGroup): Co2SavingsData {
    let obj: Co2SavingsData = {
      energyType: form.controls.energyType.value,
      totalEmissionOutputRate: form.controls.totalEmissionOutputRate.value,
      electricityUse: form.controls.electricityUse.value,
      energySource: form.controls.energySource.value,
      fuelType: form.controls.fuelType.value,
      eGridRegion: form.controls.eGridRegion.value,
      eGridSubregion: form.controls.eGridSubregion.value,
      totalEmissionOutput: form.controls.totalEmissionOutput.value,
      totalFuelEmissionOutputRate: form.controls.totalFuelEmissionOutputRate.value,
      userEnteredBaselineEmissions: form.controls.userEnteredBaselineEmissions.value,
      userEnteredModificationEmissions: form.controls.userEnteredModificationEmissions.value,
      zipcode: form.controls.zipcode.value,
    };
    return obj;
  }

  setCo2SavingsDataSettingsForm(inputObj: Co2SavingsData, settingsForm: UntypedFormGroup): UntypedFormGroup {
    settingsForm.patchValue({
      co2SavingsEnergyType: inputObj.energyType,
      co2SavingsEnergySource: inputObj.energySource,
      co2SavingsFuelType: inputObj.fuelType,
      totalEmissionOutputRate: inputObj.totalEmissionOutputRate,
      electricityUse: inputObj.electricityUse,
      eGridRegion: inputObj.eGridRegion,
      eGridSubregion: inputObj.eGridSubregion,
      totalEmissionOutput: inputObj.totalEmissionOutput,
      totalFuelEmissionOutputRate: inputObj.totalFuelEmissionOutputRate,
      userEnteredBaselineEmissions: inputObj.userEnteredBaselineEmissions,
      userEnteredModificationEmissions: inputObj.userEnteredModificationEmissions,
      zipcode: inputObj.zipcode,
    });

    return settingsForm;
  }

  getCo2SavingsDataFromSettingsForm(settingsForm: UntypedFormGroup): Co2SavingsData {
    let obj: Co2SavingsData = {
      energyType: settingsForm.controls.co2SavingsEnergyType.value || 'electricity',
      energySource: settingsForm.controls.co2SavingsEnergySource.value || 'Natural Gas',
      fuelType: settingsForm.controls.co2SavingsFuelType.value || 'Natural Gas',
      totalEmissionOutputRate: settingsForm.controls.totalEmissionOutputRate.value || 401.07,
      electricityUse: settingsForm.controls.electricityUse.value || 0,
      eGridRegion: settingsForm.controls.eGridRegion.value || '',
      eGridSubregion: settingsForm.controls.eGridSubregion.value || 'U.S. Average',
      totalEmissionOutput: settingsForm.controls.totalEmissionOutput.value || 0,
      //totalFuelEmissionOutputRate: settingsForm.controls.totalFuelEmissionOutputRate.value || 0,
      userEnteredBaselineEmissions: settingsForm.controls.userEnteredBaselineEmissions.value || false,
      userEnteredModificationEmissions: settingsForm.controls.userEnteredModificationEmissions.value || false,
      zipcode: settingsForm.controls.zipcode.value || '00000'
    };

    return obj;
  }

  getCo2SavingsDataFromSettingsObject(settings: Settings): Co2SavingsData {
    let obj: Co2SavingsData = {
      energyType: settings.co2SavingsEnergyType,
      energySource: settings.co2SavingsEnergySource,
      fuelType: settings.co2SavingsFuelType,
      totalEmissionOutputRate: settings.totalEmissionOutputRate,
      electricityUse: settings.electricityUse,
      eGridRegion: settings.eGridRegion,
      eGridSubregion: settings.eGridSubregion,
      totalEmissionOutput: settings.totalEmissionOutput,
      totalFuelEmissionOutputRate: settings.totalFuelEmissionOutputRate,
      userEnteredBaselineEmissions: settings.userEnteredBaselineEmissions,
      userEnteredModificationEmissions: settings.userEnteredModificationEmissions,
      zipcode: settings.zipcode,
    };

    return obj;
  }

  /**
 * Returns total emissions output in tons (imperial) or tonne (metric)
 * @param data - data.electricityUse in MWh OR GJ/MMBtu, EXCEPT compressed air (kWh)
 */
  getCo2EmissionsResult(data: Co2SavingsData, settings: Settings, isCombinedEnergy?: boolean): number {
    let dataCpy: Co2SavingsData = copyObject(data);
    let totalEmissionsOutput: number;
    let totalEmissionOutputRate: number = dataCpy.totalEmissionOutputRate;
    if (isCombinedEnergy) {
      totalEmissionOutputRate = dataCpy.totalFuelEmissionOutputRate;
    }
    if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
      totalEmissionOutputRate = totalEmissionOutputRate / conversionHelper;
      dataCpy.electricityUse = this.convertUnitsService.value(dataCpy.electricityUse).from('GJ').to('MMBtu');
    }
    
    if (totalEmissionOutputRate && dataCpy.electricityUse) {
      // * totalEmissionOutputRate (in kg CO2/MWh) * electricityUse (converted to MWH)
      totalEmissionsOutput = totalEmissionOutputRate * (dataCpy.electricityUse / 1000);
    } else {
      totalEmissionsOutput = 0;
    }

    if (settings.emissionsUnit !== 'Metric') {
      totalEmissionsOutput = this.convertUnitsService.value(totalEmissionsOutput).from('tonne').to('ton');
    }
    
    return totalEmissionsOutput;
  }


  getDefaultCO2Different(): Co2SavingsDifferent {
    return {
      totalEmissionOutputRate: false,
      totalFuelEmissionOutputRate: false,
      energySource: false,
      fuelType: false,
    }
  }

}

export interface Co2SavingsDifferent {
  totalEmissionOutputRate?: boolean;
  totalFuelEmissionOutputRate?: boolean,
  energySource?: boolean;
  fuelType?: boolean;
}


