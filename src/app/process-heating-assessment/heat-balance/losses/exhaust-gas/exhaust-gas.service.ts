import { inject, Injectable, Signal } from '@angular/core';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';
import { Settings } from '../../../../shared/models/settings';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { ExhaustGasCalculationService } from './exhaust-gas-calculation.service';
import { ExhaustGasForm, ExhaustGasFormService } from './exhaust-gas-form.service';

export type ExhaustGasItem = LossFormItem<ExhaustGasForm>;

@Injectable()
export class ExhaustGasService extends LossFormListService<ExhaustGasEAF, ExhaustGasForm> {
  private readonly calculationService = inject(ExhaustGasCalculationService);
  private readonly formService = inject(ExhaustGasFormService);

  protected readonly lossKey: keyof Losses = 'exhaustGasEAF';

  readonly losses: Signal<ExhaustGasItem[]> = this.items;

  protected buildForm(loss: ExhaustGasEAF): ExhaustGasForm {
    return this.formService.getExhaustGasForm(loss);
  }

  protected buildLoss(form: ExhaustGasForm): ExhaustGasEAF {
    return this.formService.buildExhaustGas(form);
  }

  protected calculateResult(form: ExhaustGasForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildExhaustGas(form), settings);
  }
}
