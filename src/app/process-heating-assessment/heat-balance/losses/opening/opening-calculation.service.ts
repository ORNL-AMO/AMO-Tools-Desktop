import { inject, Injectable } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { CircularOpeningLoss, OpeningLoss, QuadOpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';

@Injectable()
export class OpeningCalculationService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: OpeningLoss, settings: Settings): number {
    const inputs: OpeningLoss = { ...input };
    const isRound = inputs.openingType === 'Round';
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.ambientTemperature = new ConvertValue(inputs.ambientTemperature, 'C', 'F').convertedValue;
      inputs.insideTemperature = new ConvertValue(inputs.insideTemperature, 'C', 'F').convertedValue;
      inputs.thickness = new ConvertValue(inputs.thickness, 'mm', 'in').convertedValue;
      inputs.lengthOfOpening = new ConvertValue(inputs.lengthOfOpening, 'mm', 'in').convertedValue;
      if (!isRound) {
        inputs.heightOfOpening = new ConvertValue(inputs.heightOfOpening, 'mm', 'in').convertedValue;
      }
    }

    const result = isRound
      ? this.processHeatingApiService.openingLossesCircular(this.toCircular(inputs))
      : this.processHeatingApiService.openingLossesQuad(this.toQuad(inputs));

    const converted = isNaN(result) ? 0 : new ConvertValue(result, 'Btu', settings.energyResultUnit).convertedValue;
    return converted * (inputs.numberOfOpenings ?? 0);
  }

  private toCircular(loss: OpeningLoss): CircularOpeningLoss {
    return {
      emissivity: loss.emissivity,
      diameter: loss.lengthOfOpening,
      thickness: loss.thickness,
      ambientTemperature: loss.ambientTemperature,
      insideTemperature: loss.insideTemperature,
      percentTimeOpen: loss.percentTimeOpen,
      viewFactor: loss.viewFactor,
    };
  }

  private toQuad(loss: OpeningLoss): QuadOpeningLoss {
    return {
      emissivity: loss.emissivity,
      length: loss.lengthOfOpening,
      width: loss.heightOfOpening,
      thickness: loss.thickness,
      ambientTemperature: loss.ambientTemperature,
      insideTemperature: loss.insideTemperature,
      percentTimeOpen: loss.percentTimeOpen,
      viewFactor: loss.viewFactor,
    };
  }
}
