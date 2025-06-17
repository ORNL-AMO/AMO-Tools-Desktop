import { Injectable } from '@angular/core';
import { BagMethodInput } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class BagMethodService {

  bagMethodInputs: {
    inputsArray: Array<BagMethodInput>,
    operatingHours: number
  } = {
      inputsArray: new Array<BagMethodInput>(),
      operatingHours: 8760
    };

  operatingHours: OperatingHours;

  constructor(private convertUnitsService: ConvertUnitsService) {
    this.bagMethodInputs = this.getDefault();
  }

  getDefault(): {
    inputsArray: Array<BagMethodInput>,
    operatingHours: number
  } {
    let inputsArray: Array<BagMethodInput> = new Array();
    let input: BagMethodInput = {
      operatingTime: 0,
      bagFillTime: 0,
      bagVolume: 0,
      numberOfUnits: 1
    };
    inputsArray.push(input);
    return {
      inputsArray: inputsArray,
      operatingHours: 8760
    }
  }

  getExample(): {
    inputsArray: Array<BagMethodInput>,
    operatingHours: number
  } {
    return {
      operatingHours: 8760,
      inputsArray: [
        {
          operatingTime: 8760,
          bagFillTime: 50,
          bagVolume: 45,
          numberOfUnits: 1
        },
        {
          operatingTime: 8760,
          bagFillTime: 360,
          bagVolume: 60,
          numberOfUnits: 1
        }
      ]
    }
  }

  convertLeakLossEstimatorExample(inputs: Array<BagMethodInput>, settings: Settings) {
    let tmpInputs: Array<BagMethodInput> = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < tmpInputs.length; i++) {
        tmpInputs[i].bagVolume = Math.round(this.convertUnitsService.value(tmpInputs[i].bagVolume).from('L').to('gal'));
      }
      return tmpInputs;
    }
    return tmpInputs;
  }

}
