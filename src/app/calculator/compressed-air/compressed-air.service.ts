import { Injectable } from '@angular/core';
import { AirVelocityInput, BagMethodInput, PneumaticValve, OperatingCostInput, PipeSizingInput, PneumaticAirRequirementInput, CalculateUsableCapacity, ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankGeneral, ReceiverTankMeteredStorage, AirSystemCapacityInput } from '../../shared/models/standalone';
import { OperatingHours } from '../../shared/models/operations';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class CompressedAirService {

  pnuematicValveInputs: PneumaticValve = {
    inletPressure: 0,
    outletPressure: 0,
    flowRate: 0
  };  

  constructor(private convertUnitsService: ConvertUnitsService) {
  }

  convertAirSystemCapacityExample(inputs: AirSystemCapacityInput, settings: Settings) {
    let tmpInputs: AirSystemCapacityInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.oneHalf = Math.round(this.convertUnitsService.value(tmpInputs.oneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.threeFourths = Math.round(this.convertUnitsService.value(tmpInputs.threeFourths).from('ft').to('m') * 100) / 100;
      tmpInputs.one = Math.round(this.convertUnitsService.value(tmpInputs.one).from('ft').to('m') * 100) / 100;
      tmpInputs.oneAndOneFourth = Math.round(this.convertUnitsService.value(tmpInputs.oneAndOneFourth).from('ft').to('m') * 100) / 100;
      tmpInputs.oneAndOneHalf = Math.round(this.convertUnitsService.value(tmpInputs.oneAndOneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.two = Math.round(this.convertUnitsService.value(tmpInputs.two).from('ft').to('m') * 100) / 100;
      tmpInputs.twoAndOneHalf = Math.round(this.convertUnitsService.value(tmpInputs.twoAndOneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.three = Math.round(this.convertUnitsService.value(tmpInputs.three).from('ft').to('m') * 100) / 100;
      tmpInputs.threeAndOneHalf = Math.round(this.convertUnitsService.value(tmpInputs.threeAndOneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.four = Math.round(this.convertUnitsService.value(tmpInputs.four).from('ft').to('m') * 100) / 100;
      tmpInputs.five = Math.round(this.convertUnitsService.value(tmpInputs.five).from('ft').to('m') * 100) / 100;
      tmpInputs.six = Math.round(this.convertUnitsService.value(tmpInputs.six).from('ft').to('m') * 100) / 100;
      for (let i = 0; i < tmpInputs.receiverCapacities.length; i++) {
        tmpInputs.receiverCapacities[i] = Math.round(this.convertUnitsService.value(tmpInputs.receiverCapacities[i]).from('gal').to('m3') * 100) / 100;
      }
    }
    return tmpInputs;
  }

}
