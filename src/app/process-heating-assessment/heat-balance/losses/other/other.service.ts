import { inject, Injectable, Signal } from '@angular/core';
import { OtherLoss } from '../../../../shared/models/phast/losses/otherLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { OtherForm, OtherFormService } from './other-form.service';

export type OtherItem = LossFormItem<OtherForm>;

@Injectable()
export class OtherService extends LossFormListService<OtherLoss, OtherForm> {
  private readonly formService = inject(OtherFormService);

  protected readonly lossKey: keyof Losses = 'otherLosses';

  readonly losses: Signal<OtherItem[]> = this.items;

  protected buildForm(loss: OtherLoss): OtherForm {
    return this.formService.getOtherForm(loss);
  }

  protected buildLoss(form: OtherForm): OtherLoss {
    return this.formService.buildOtherLoss(form);
  }

  protected calculateResult(form: OtherForm): number {
    return form.controls.heatLoss.value ?? 0;
  }
}
