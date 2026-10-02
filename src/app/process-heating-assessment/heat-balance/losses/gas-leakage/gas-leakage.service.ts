import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { GasLeakageCalculationService } from './gas-leakage-calculation.service';
import { GasLeakageForm, GasLeakageFormService } from './gas-leakage-form.service';

export type GasLeakageItem = LossFormItem<GasLeakageForm>;

@Injectable()
export class GasLeakageService extends LossFormListService<LeakageLoss, GasLeakageForm> {
  private readonly calculationService = inject(GasLeakageCalculationService);
  private readonly formService = inject(GasLeakageFormService);

  protected readonly lossKey: keyof Losses = 'leakageLosses';

  readonly losses: Signal<GasLeakageItem[]> = this.items;

  protected buildForm(loss: LeakageLoss): GasLeakageForm {
    return this.formService.getGasLeakageForm(loss);
  }

  protected buildLoss(form: GasLeakageForm): LeakageLoss {
    return this.formService.buildGasLeakageLoss(form);
  }

  protected calculateResult(form: GasLeakageForm, settings: Settings): number {
    const loss = this.formService.buildGasLeakageLoss(form);
    return this.calculationService.calculate(loss, settings);
  }
}
