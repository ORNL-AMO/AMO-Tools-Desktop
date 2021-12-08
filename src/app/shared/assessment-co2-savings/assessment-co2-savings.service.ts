import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Settings } from '../models/settings';

@Injectable()
export class AssessmentCo2SavingsService {

  co2SavingsField: BehaviorSubject<string>;
  baselineCo2SavingsData: BehaviorSubject<Co2SavingsData>;
  modificationCo2SavingsData: BehaviorSubject<Co2SavingsData>;

  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) {
    this.co2SavingsField = new BehaviorSubject<string>(undefined);
    this.baselineCo2SavingsData = new BehaviorSubject<Co2SavingsData>(undefined);
    this.modificationCo2SavingsData = new BehaviorSubject<Co2SavingsData>(undefined);
   }

  getEmissionsForm(inputObj: Co2SavingsData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      energyType: [inputObj.energyType],
      energySource: [inputObj.energySource],
      totalEmissionOutputRate: [inputObj.totalEmissionOutputRate],
      electricityUse: [inputObj.electricityUse],
      fuelType: [inputObj.fuelType ],
      eGridRegion: [inputObj.eGridRegion],
      eGridSubregion: [inputObj.eGridSubregion],
      totalEmissionOutput: [inputObj.totalEmissionOutput],
      userEnteredBaselineEmissions: [inputObj.userEnteredBaselineEmissions],
      userEnteredModificationEmissions: [inputObj.userEnteredModificationEmissions],
      zipcode: [inputObj.zipcode],
    });

    return form;
  }

  getCo2SavingsData(form: FormGroup): Co2SavingsData {
    let obj: Co2SavingsData = {
      energyType: form.controls.energyType.value,
      totalEmissionOutputRate: form.controls.totalEmissionOutputRate.value,
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

  setCo2SavingsDataSettingsForm(inputObj: Co2SavingsData, settingsForm: FormGroup): FormGroup {
    settingsForm.patchValue({
      co2SavingsEnergyType: inputObj.energyType,
      co2SavingsEnergySource: inputObj.energySource,
      co2SavingsFuelType: inputObj.fuelType,
      totalEmissionOutputRate: inputObj.totalEmissionOutputRate,
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

  getCo2SavingsDataFromSettingsForm(settingsForm: FormGroup): Co2SavingsData {
    let obj: Co2SavingsData = {
      energyType: settingsForm.controls.co2SavingsEnergyType.value,
      energySource: settingsForm.controls.co2SavingsEnergySource.value,
      fuelType: settingsForm.controls.co2SavingsFuelType.value,
      totalEmissionOutputRate: settingsForm.controls.totalEmissionOutputRate.value,
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
      userEnteredBaselineEmissions: settings.userEnteredBaselineEmissions,
      userEnteredModificationEmissions: settings.userEnteredModificationEmissions,
      zipcode: settings.zipcode,
    };

    return obj;
  }

  getCo2EmissionsResult(data: Co2SavingsData, settings: Settings): number {
    //use copy for conversion data
    let dataCpy: Co2SavingsData = JSON.parse(JSON.stringify(data));
    let totalEmissionsResult: number;
    if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
      dataCpy.totalEmissionOutputRate = dataCpy.totalEmissionOutputRate / conversionHelper;
      dataCpy.electricityUse = this.convertUnitsService.value(dataCpy.electricityUse).from('GJ').to('MMBtu');
    }
    if (dataCpy.totalEmissionOutputRate && dataCpy.electricityUse) {
      // debugger;
      //set results on original obj
      totalEmissionsResult = (dataCpy.totalEmissionOutputRate) * (dataCpy.electricityUse / 1000);
    } else {
      // debugger;
      totalEmissionsResult = 0;
    }
    return totalEmissionsResult;
  }
}

