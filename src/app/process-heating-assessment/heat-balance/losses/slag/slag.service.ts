import { inject, Injectable, Signal } from '@angular/core';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { Settings } from '../../../../shared/models/settings';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { SlagCalculationService } from './slag-calculation.service';
import { SlagForm, SlagFormService } from './slag-form.service';

export type SlagItem = LossFormItem<SlagForm>;

@Injectable()
export class SlagService extends LossFormListService<Slag, SlagForm> {
  private readonly calculationService = inject(SlagCalculationService);
  private readonly formService = inject(SlagFormService);

  protected readonly lossKey: keyof Losses = 'slagLosses';

  readonly losses: Signal<SlagItem[]> = this.items;

  protected buildForm(loss: Slag): SlagForm {
    return this.formService.getSlagForm(loss);
  }

  protected buildLoss(form: SlagForm): Slag {
    return this.formService.buildSlag(form);
  }

  protected calculateResult(form: SlagForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildSlag(form), settings);
  }
}
