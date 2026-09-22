import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { AtmosphereCalculationService } from './atmosphere-calculation.service';
import { AtmosphereForm, AtmosphereFormService } from './atmosphere-form.service';

export type AtmosphereItem = LossFormItem<AtmosphereForm>;

@Injectable()
export class AtmosphereService extends LossFormListService<AtmosphereLoss, AtmosphereForm> {
  private readonly calculationService = inject(AtmosphereCalculationService);
  private readonly formService = inject(AtmosphereFormService);

  protected readonly lossKey: keyof Losses = 'atmosphereLosses';

  readonly losses: Signal<AtmosphereItem[]> = this.items;

  protected buildForm(loss: AtmosphereLoss): AtmosphereForm {
    return this.formService.getAtmosphereForm(loss);
  }

  protected buildLoss(form: AtmosphereForm): AtmosphereLoss {
    return this.formService.buildAtmosphereLoss(form);
  }

  protected calculateResult(form: AtmosphereForm, settings: Settings): number {
    const loss = this.formService.buildAtmosphereLoss(form);
    return this.calculationService.calculate(loss, settings);
  }
}
