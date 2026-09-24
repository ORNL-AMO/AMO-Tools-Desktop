import { inject, Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { CircularOpeningLoss, OpeningLoss, QuadOpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';

@Injectable()
export class OpeningCalculationService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  calculate(input: OpeningLoss, settings: Settings): number {
    const inputs: OpeningLoss = { ...input };
    const isRound = inputs.openingType === 'Round';
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.ambientTemperature = this.convertUnitsService.value(inputs.ambientTemperature).from('C').to('F');
      inputs.insideTemperature = this.convertUnitsService.value(inputs.insideTemperature).from('C').to('F');
      inputs.thickness = this.convertUnitsService.value(inputs.thickness).from('mm').to('in');
      inputs.lengthOfOpening = this.convertUnitsService.value(inputs.lengthOfOpening).from('mm').to('in');
      if (!isRound) {
        inputs.heightOfOpening = this.convertUnitsService.value(inputs.heightOfOpening).from('mm').to('in');
      }
    }

    const result = isRound
      ? this.processHeatingApiService.openingLossesCircular(this.toCircular(inputs))
      : this.processHeatingApiService.openingLossesQuad(this.toQuad(inputs));

    const converted = isNaN(result) ? 0 : this.convertUnitsService.value(result).from('Btu').to(settings.energyResultUnit);
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
