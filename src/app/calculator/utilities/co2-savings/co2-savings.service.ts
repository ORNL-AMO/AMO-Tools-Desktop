import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { MeasurStandardUnitType } from '../../../shared/models/app';
import { ConvertValue } from '../../../shared/convert-units/ConvertValue';
import { copyObject } from '../../../shared/helperFunctions';

@Injectable()
export class Co2SavingsService {
  baselineData: Array<Co2SavingsData>;
  modificationData: Array<Co2SavingsData>;

  // * use app default tonnes
  emissionsUnit: MeasurStandardUnitType = 'Metric';
  constructor(private convertUnitsService: ConvertUnitsService) { }

  setEmissionsUnit(settings: Settings) {
    if (settings.emissionsUnit) {
      this.emissionsUnit = settings.emissionsUnit;
    } else {
      this.emissionsUnit = settings.unitsOfMeasure as MeasurStandardUnitType;
    }
  }

  generateExample(isBaseline: boolean, settings: Settings): Co2SavingsData {
    let emissionOutputRate: number = 53.06;
    let electricityUse: number = 1995;
    if (!isBaseline) {
      electricityUse = 1500;
    }
    if (settings.unitsOfMeasure != 'Imperial') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('MMBtu').to('GJ');
      emissionOutputRate = emissionOutputRate / conversionHelper;
      emissionOutputRate = Number(emissionOutputRate.toFixed(3));
      electricityUse = this.convertUnitsService.value(electricityUse).from('MMBtu').to('GJ');
      electricityUse = Number(electricityUse.toFixed(3));
    }
    return {
      energyType: 'fuel',
      totalEmissionOutputRate: emissionOutputRate,
      electricityUse: electricityUse,
      fuelType: 'Natural Gas',
      energySource: 'Natural Gas',
      totalEmissionOutput: 0
    };
  }

  calculate(data: Co2SavingsData, settings: Settings): Co2SavingsData {
    let formData: Co2SavingsData = copyObject(data);
    let totalEmissionOutput: number = 0;

    if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
      formData.totalEmissionOutputRate = formData.totalEmissionOutputRate / conversionHelper;
      formData.electricityUse = this.convertUnitsService.value(formData.electricityUse).from('GJ').to('MMBtu');
    }

    if (formData.totalEmissionOutputRate && formData.electricityUse) {
      // * formData.totalEmissionOutputRate (in kg CO2/MWh OR kb Co2/MMBtu) * formData.electricityUse
      // * divide by 1000 to convert kg CO2 to tonnes or kb CO2 to tons, ie (1 tonne / 1000 kg)

      // * tonnes
      totalEmissionOutput = formData.totalEmissionOutputRate * (formData.electricityUse / 1000);
    } 

    if (this.emissionsUnit == 'Imperial') {
      totalEmissionOutput = new ConvertValue(totalEmissionOutput, 'tonne', 'ton').convertedValue;
    } 

    data.totalEmissionOutput = totalEmissionOutput;
    return data;
  }
}

export interface Co2SavingsData {
  energyType: string;
  totalEmissionOutputRate: number;
  totalFuelEmissionOutputRate?: number,
  electricityUse: number;
  energySource?: string;
  fuelType?: string;
  eGridRegion?: string;
  eGridSubregion?: string;
  totalEmissionOutput: number;
  userEnteredBaselineEmissions?: boolean;
  userEnteredModificationEmissions?: boolean;
  zipcode?: string,
  percentFuelUsage?: number,
  otherFuelMixedCO2SavingsData?: Array<Co2SavingsData>
}
