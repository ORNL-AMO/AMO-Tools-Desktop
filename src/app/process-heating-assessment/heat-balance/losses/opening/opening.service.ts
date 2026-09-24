import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { OpeningCalculationService } from './opening-calculation.service';
import { OpeningForm, OpeningFormService } from './opening-form.service';

export type OpeningItem = LossFormItem<OpeningForm>;

@Injectable()
export class OpeningService extends LossFormListService<OpeningLoss, OpeningForm> {
  private readonly calculationService = inject(OpeningCalculationService);
  private readonly formService = inject(OpeningFormService);

  protected readonly lossKey: keyof Losses = 'openingLosses';

  readonly losses: Signal<OpeningItem[]> = this.items;

  protected buildForm(loss: OpeningLoss): OpeningForm {
    return this.formService.getOpeningForm(loss);
  }

  protected buildLoss(form: OpeningForm): OpeningLoss {
    return this.formService.buildOpeningLoss(form);
  }

  protected calculateResult(form: OpeningForm, settings: Settings): number {
    const loss = this.formService.buildOpeningLoss(form);
    return this.calculationService.calculate(loss, settings);
  }
}
