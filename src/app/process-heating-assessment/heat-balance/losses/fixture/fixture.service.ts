import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { FixtureCalculationService } from './fixture-calculation.service';
import { FixtureForm, FixtureFormService } from './fixture-form.service';

export type FixtureItem = LossFormItem<FixtureForm>;

@Injectable()
export class FixtureService extends LossFormListService<FixtureLoss, FixtureForm> {
  private readonly calculationService = inject(FixtureCalculationService);
  private readonly formService = inject(FixtureFormService);

  protected readonly lossKey: keyof Losses = 'fixtureLosses';

  readonly losses: Signal<FixtureItem[]> = this.items;

  protected buildForm(loss: FixtureLoss): FixtureForm {
    return this.formService.getFixtureForm(loss);
  }

  protected buildLoss(form: FixtureForm): FixtureLoss {
    return this.formService.buildFixtureLoss(form);
  }

  protected calculateResult(form: FixtureForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildFixtureLoss(form), settings);
  }
}
