import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class Co2SavingsService {
  baselineData: Array<Co2SavingsData>;
  modificationData: Array<Co2SavingsData>;
  constructor(private convertUnitsService: ConvertUnitsService) { }

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
    //use copy for conversion data
    let dataCpy: Co2SavingsData = JSON.parse(JSON.stringify(data));
    if (settings.unitsOfMeasure != 'Imperial' && data.energyType == 'fuel') {
      let conversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
      dataCpy.totalEmissionOutputRate = dataCpy.totalEmissionOutputRate / conversionHelper;
      dataCpy.electricityUse = this.convertUnitsService.value(dataCpy.electricityUse).from('GJ').to('MMBtu');
    }
    if (dataCpy.totalEmissionOutputRate && dataCpy.electricityUse) {
      //set results on original obj
      data.totalEmissionOutput = (dataCpy.totalEmissionOutputRate) * (dataCpy.electricityUse / 1000);
    } else {
      data.totalEmissionOutput = 0;
    }

    if (settings.unitsOfMeasure !== 'Metric') {
      data.totalEmissionOutput = this.convertUnitsService.value(data.totalEmissionOutput).from('tonne').to('ton');
    }

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
