import { Injectable } from '@angular/core';
import { PneumaticValveCvInput, PneumaticValveFlowRateInput } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PneumaticValveService {

  flowRateInputs: PneumaticValveFlowRateInput;
  cvInputs: PneumaticValveCvInput;

  constructor(private convertUnitsService: ConvertUnitsService) {
    this.flowRateInputs = this.getDefaultFlowRateData();
    this.cvInputs = this.getDefaultCvData();
  }

  getDefaultFlowRateData(): PneumaticValveFlowRateInput {
    return {
      inletPressure: 0,
      outletPressure: 0
    };
  }

  getDefaultCvData(): PneumaticValveCvInput {
    return {
      inletPressure: 0,
      outletPressure: 0,
      flowRate: 0
    };
  }

  getExampleFlowRateData(): PneumaticValveFlowRateInput {
    return {
      inletPressure: 100,
      outletPressure: 70
    };
  }

  getExampleCvData(): PneumaticValveCvInput {
    return {
      inletPressure: 80,
      outletPressure: 75,
      flowRate: 55
    };
  }

  convertFlowRateExample(inputs: PneumaticValveFlowRateInput, settings: Settings): PneumaticValveFlowRateInput {
    let tmpInputs: PneumaticValveFlowRateInput = JSON.parse(JSON.stringify(inputs));
    if (settings.unitsOfMeasure === 'Metric') {
      tmpInputs.inletPressure = Math.round(this.convertUnitsService.value(tmpInputs.inletPressure).from('psia').to('kPaa') * 100) / 100;
      tmpInputs.outletPressure = Math.round(this.convertUnitsService.value(tmpInputs.outletPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertCvExample(inputs: PneumaticValveCvInput, settings: Settings): PneumaticValveCvInput {
    let tmpInputs: PneumaticValveCvInput = JSON.parse(JSON.stringify(inputs));
    if (settings.unitsOfMeasure === 'Metric') {
      tmpInputs.inletPressure = Math.round(this.convertUnitsService.value(tmpInputs.inletPressure).from('psia').to('kPaa') * 100) / 100;
      tmpInputs.outletPressure = Math.round(this.convertUnitsService.value(tmpInputs.outletPressure).from('psia').to('kPaa') * 100) / 100;
      tmpInputs.flowRate = Math.round(this.convertUnitsService.value(tmpInputs.flowRate).from('ft3').to('m3') * 100) / 100;
    }
    return tmpInputs;
  }
}
