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
      heightOfBag: 0,
      diameterOfBag: 0,
      numberOfUnits: 0
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
      operatingHours: 5000,
      inputsArray: [
        {
          operatingTime: 5000,
          bagFillTime: 300,
          heightOfBag: 50,
          diameterOfBag: 40,
          numberOfUnits: 1
        },
        {
          operatingTime: 5000,
          bagFillTime: 360,
          heightOfBag: 50,
          diameterOfBag: 48,
          numberOfUnits: 1
        }
      ]
    }
  }

  convertLeakLossEstimatorExample(inputs: Array<BagMethodInput>, settings: Settings) {
    let tmpInputs: Array<BagMethodInput> = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < tmpInputs.length; i++) {
        tmpInputs[i].diameterOfBag = Math.round(this.convertUnitsService.value(tmpInputs[i].diameterOfBag).from('in').to('cm') * 100) / 100;
        tmpInputs[i].heightOfBag = Math.round(this.convertUnitsService.value(tmpInputs[i].heightOfBag).from('in').to('cm') * 100) / 100;
      }
      return tmpInputs;
    }
    return tmpInputs;
  }

}
