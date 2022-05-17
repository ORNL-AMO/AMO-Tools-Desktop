import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { BleedTestInput } from '../../../shared/models/standalone';

@Injectable()
export class BleedTestService {

  inputs: BleedTestInput;
  constructor(private convertUnitsService: ConvertUnitsService) { 
    this.inputs = this.getDefaultData();
   }

  getDefaultData(): BleedTestInput {
    return {
      totalSystemVolume: 0,
      normalOperatingPressure: 150,
      testPressure: 75,
      time: 0
    }
  }

  getExampleData(): BleedTestInput {
    return {
      totalSystemVolume: 100,
      normalOperatingPressure: 150,
      testPressure: 75,
      time: 120
    }
  }

  convertBleedTestExample(inputs: BleedTestInput, settings: Settings): BleedTestInput {
    let tmpInputs: BleedTestInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.totalSystemVolume = Math.round(this.convertUnitsService.value(tmpInputs.totalSystemVolume).from('ft3').to('m3') * 100) / 100;
      tmpInputs.normalOperatingPressure = Math.round(this.convertUnitsService.value(tmpInputs.normalOperatingPressure).from('psig').to('kPa') * 100) / 100;
      tmpInputs.testPressure = Math.round(this.convertUnitsService.value(tmpInputs.testPressure).from('psig').to('kPa') * 100) / 100;
      //tmpInputs.time = Math.round(this.convertUnitsService.value(tmpInputs.time).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  bleedTest(input: BleedTestInput, settings: Settings): number {
    let leakage: number;    
    let tmpInputs: BleedTestInput = input;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.totalSystemVolume = this.convertUnitsService.value(tmpInputs.totalSystemVolume).from('m3').to('ft3');
      tmpInputs.normalOperatingPressure = this.convertUnitsService.value(tmpInputs.normalOperatingPressure).from('kPa').to('psig');
      tmpInputs.testPressure = this.convertUnitsService.value(tmpInputs.testPressure).from('kPa').to('psig');
    }
    leakage = (tmpInputs.totalSystemVolume * (tmpInputs.normalOperatingPressure - tmpInputs.testPressure) / tmpInputs.time * 14.7 ) * 1.25;
    
    return leakage;
  }

}
